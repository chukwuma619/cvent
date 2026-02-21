import { ccc } from "@ckb-ccc/core";

const SHANNONS_PER_CKB = 100_000_000;

const NONCE_PREFIX = "cvent:";
const NONCE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

/** Check that message is a valid cvent nonce and not expired. */
export function isNonceValid(message: string): boolean {
  if (typeof message !== "string" || !message.startsWith(NONCE_PREFIX)) {
    return false;
  }
  const rest = message.slice(NONCE_PREFIX.length);
  const firstColon = rest.indexOf(":");
  if (firstColon === -1) return false;
  const timestamp = Number.parseInt(rest.slice(0, firstColon), 10);
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < NONCE_MAX_AGE_MS;
}

type WalletSignatureLike = {
  signature: string;
  identity?: string;
  signType: string;
};

/**
 * Verify a wallet signature (message signed by CKB wallet).
 * Returns true if the signature is valid and the signer matches the expected address.
 * For CkbSecp256k1, identity is public key – we derive address and compare.
 * For JoyId and others, we trust the client address after verification.
 */
export async function verifyWalletSignature(
  message: string,
  signature: WalletSignatureLike,
  expectedAddress: string
): Promise<boolean> {
  const ok = await ccc.Signer.verifyMessage(message, signature as never);
  if (!ok) return false;

  const signType = (signature as { signType?: string }).signType;
  const identity = (signature as { identity?: string }).identity;

  if (signType === "CkbSecp256k1" && typeof identity === "string") {
    const rpcUrl =
      process.env.CKB_RPC_URL?.trim() || "https://mainnet.ckb.dev";
    try {
      const pubkeyHex = identity.startsWith("0x") ? identity : `0x${identity}`;
      const hashBytes = ccc.bytesFrom(ccc.hashCkb(ccc.bytesFrom(pubkeyHex)));
      const args = hashBytes.slice(0, 20);
      const clients = {
        ckb: new ccc.ClientPublicMainnet({ url: rpcUrl }),
        ckt: new ccc.ClientPublicTestnet({ url: rpcUrl }),
      };
      const addrCkb = await ccc.Address.fromKnownScript(
        clients.ckb,
        ccc.KnownScript.Secp256k1Blake160,
        args
      );
      const addrCkt = await ccc.Address.fromKnownScript(
        clients.ckt,
        ccc.KnownScript.Secp256k1Blake160,
        args
      );
      const derivedCkb = addrCkb.toString();
      const derivedCkt = addrCkt.toString();
      const expected = expectedAddress.trim();
      return derivedCkb === expected || derivedCkt === expected;
    } catch {
      return false;
    }
  }

  if (typeof identity === "string" && identity === expectedAddress.trim()) {
    return true;
  }
  return true;
}

/** Fetch CKB price in given currency (e.g. "usd") from CoinGecko. */
export async function getCkbPriceInCurrency(
  currency: string
): Promise<number> {
  const cur = currency.toLowerCase();
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=nervos-network&vs_currencies=${cur}`,
    { next: { revalidate: 60 }, headers: { Accept: "application/json" } }
  );
  if (!res.ok) {
    throw new Error(`CoinGecko responded with ${res.status}`);
  }
  const data = (await res.json()) as {
    "nervos-network"?: { [key: string]: number };
  };
  const price = data["nervos-network"]?.[cur];
  if (typeof price !== "number" || price <= 0) {
    throw new Error("Invalid CKB price");
  }
  return price;
}

/** Minimum CKB shannons required to cover priceCents in the given currency. */
export async function getMinShannonsForPriceCents(
  priceCents: number,
  currency: string
): Promise<number> {
  const ckbPrice = await getCkbPriceInCurrency(currency);
  const priceFiat = priceCents / 100;
  const ckbAmount = priceFiat / ckbPrice;
  return Math.ceil(ckbAmount * SHANNONS_PER_CKB);
}

/** CKB RPC get_transaction result (minimal shape we need). RPC may use snake_case or camelCase. */
type GetTransactionResult = {
  tx_status: { status: string };
  transaction: {
    outputs: Array<{
      capacity: string;
      lock: {
        code_hash?: string;
        codeHash?: string;
        args: string;
        hash_type?: string;
        hashType?: string;
      };
    }>;
  };
};

/** Call CKB JSON-RPC get_transaction. */
async function ckbRpcGetTransaction(
  rpcUrl: string,
  txHash: string
): Promise<GetTransactionResult | null> {
  const normalizedHash =
    txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "get_transaction",
      params: [normalizedHash],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: GetTransactionResult; error?: { message: string } };
  if (json.error) return null;
  return json.result ?? null;
}

/** Script shape for comparison (code_hash, args, hash_type). */
export type LockScriptLike = {
  code_hash: string;
  args: string;
  hash_type: string;
};

/** Normalize a script-like object (CCC or RPC) to LockScriptLike. */
function toLockScriptLike(script: {
  code_hash?: string;
  codeHash?: string;
  args?: string;
  hash_type?: string;
  hashType?: string;
}): LockScriptLike {
  return {
    code_hash: script.code_hash ?? script.codeHash ?? "",
    args: script.args ?? "",
    hash_type: script.hash_type ?? script.hashType ?? "",
  };
}

/**
 * Parse CKB address to lock script using CCC SDK (@ckb-ccc/core).
 * Address.fromString requires clients keyed by address prefix (ckb/ckt); base
 * ClientJsonRpc has no addressPrefix, so we use ClientPublicMainnet and
 * ClientPublicTestnet with the same RPC URL.
 * Returns null if parsing fails (e.g. invalid address or RPC error).
 */
async function addressToLockScript(
  address: string,
  rpcUrl: string
): Promise<LockScriptLike | null> {
  try {
    const config = { url: rpcUrl };
    const clients = {
      ckb: new ccc.ClientPublicMainnet(config),
      ckt: new ccc.ClientPublicTestnet(config),
    };
    const addr = await ccc.Address.fromString(address.trim(), clients);
    const script = (addr as unknown as { script?: Record<string, unknown> }).script;
    if (!script || typeof script !== "object") return null;
    return toLockScriptLike(script as Parameters<typeof toLockScriptLike>[0]);
  } catch (err) {
    console.error("addressToLockScript:", err instanceof Error ? err.message : err);
    return null;
  }
}

function scriptsMatch(a: LockScriptLike, b: LockScriptLike): boolean {
  return (
    a.code_hash === b.code_hash &&
    a.args === b.args &&
    a.hash_type === b.hash_type
  );
}

/**
 * Verify that the transaction is committed on-chain and that at least one output
 * pays the recipient lock script with capacity >= minCapacityShannons.
 * Returns false if RPC URL is missing, tx not found, not committed, or payment not found.
 */
export async function verifyTransactionPaysRecipient(
  rpcUrl: string | undefined,
  txHash: string,
  recipientAddress: string,
  minCapacityShannons: number
): Promise<boolean> {
  const url = rpcUrl?.trim();
  if (!url) return false;
  const recipientLock = await addressToLockScript(recipientAddress.trim(), url);
  if (!recipientLock) return false;

  const txResult = await ckbRpcGetTransaction(url, txHash);
  if (!txResult) return false;
  if (txResult.tx_status?.status !== "committed") return false;

  const outputs = txResult.transaction?.outputs ?? [];
  for (const out of outputs) {
    const lock = out.lock;
    if (!lock) continue;
    const normalizedLock = toLockScriptLike(lock);
    if (!scriptsMatch(recipientLock, normalizedLock)) continue;
    const capacityHex = out.capacity;
    if (!capacityHex || typeof capacityHex !== "string") continue;
    const capacity = parseInt(capacityHex, 16);
    if (Number.isNaN(capacity)) continue;
    if (capacity >= minCapacityShannons) return true;
  }
  return false;
}
