"use client";

import { Provider as ConnectorReactProvider } from "@ckb-ccc/connector-react";

export const ConnectorReactClientProvider = ({ children }: { children: React.ReactNode }) => {
  return <ConnectorReactProvider>{children}</ConnectorReactProvider>;
};