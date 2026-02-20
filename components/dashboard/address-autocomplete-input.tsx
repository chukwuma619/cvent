"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/** Result passed to onPlaceSelect (Place Autocomplete Data API). */
export type PlaceSelectResult = {
  formattedAddress: string;
  /** City name from locality or administrative_area_level_2, if available. */
  locality?: string;
};

type AddressAutocompleteInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (result: PlaceSelectResult) => void;
  apiKey?: string;
};

function getLocalityFromAddressComponents(
  components: Array<{ longText?: string; long_name?: string; types?: string[] }> | undefined,
): string | undefined {
  if (!components?.length) return undefined;
  const withLocality = components.find((c) => c.types?.includes("locality"));
  if (withLocality?.longText ?? withLocality?.long_name) {
    return (withLocality.longText ?? withLocality.long_name) as string;
  }
  const withAdmin2 = components.find((c) =>
    c.types?.includes("administrative_area_level_2"),
  );
  return (withAdmin2?.longText ?? withAdmin2?.long_name) as string | undefined;
}

const DEBOUNCE_MS = 300;
const MIN_INPUT_LENGTH = 2;

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  apiKey,
  className,
  id,
  placeholder = "Full address",
  ...props
}: AddressAutocompleteInputProps) {
  const key = apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const [suggestions, setSuggestions] = useState<
    Array<{ placePrediction: { text: { toString(): string }; toPlace(): google.maps.places.Place } }>
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionTokenRef = useRef<InstanceType<typeof google.maps.places.AutocompleteSessionToken> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
    onChangeRef.current = onChange;
  }, [onPlaceSelect, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(ev.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (inputValue: string) => {
      if (!key || inputValue.length < MIN_INPUT_LENGTH) {
        setSuggestions([]);
        return;
      }
      try {
        setLoading(true);
        setOptions({ key, v: "weekly" });
        const { AutocompleteSessionToken, AutocompleteSuggestion } =
          (await importLibrary("places")) as google.maps.PlacesLibrary & {
            AutocompleteSessionToken: new () => google.maps.places.AutocompleteSessionToken;
            AutocompleteSuggestion: {
              fetchAutocompleteSuggestions(req: {
                input: string;
                sessionToken?: google.maps.places.AutocompleteSessionToken;
              }): Promise<{ suggestions: Array<{ placePrediction: { text: { toString(): string }; toPlace(): google.maps.places.Place } }> }>;
            };
          };

        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        const request = {
          input: inputValue,
          sessionToken: sessionTokenRef.current,
        };

        const { suggestions: nextSuggestions } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        setSuggestions(nextSuggestions ?? []);
        setIsOpen(true);
      } catch (err) {
        console.error("Places autocomplete request failed:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      onChangeRef.current(next);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!next.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      debounceRef.current = setTimeout(() => {
        fetchSuggestions(next.trim());
        debounceRef.current = null;
      }, DEBOUNCE_MS);
    },
    [fetchSuggestions],
  );

  const handleSelectSuggestion = useCallback(
    async (placePrediction: { text: { toString(): string }; toPlace(): google.maps.Place }) => {
      if (!key) return;
      try {
        setLoading(true);
        setSuggestions([]);
        setIsOpen(false);

        const place = placePrediction.toPlace() as google.maps.places.Place & {
          fetchFields(opts: { fields: string[] }): Promise<void>;
        };
        await place.fetchFields({
          fields: ["formattedAddress", "addressComponents"],
        });

        const formattedAddress =
          (place as { formattedAddress?: string }).formattedAddress ?? "";
        onChangeRef.current(formattedAddress);

        const addressComponents = (place as {
          addressComponents?: Array<{
            longText?: string;
            long_name?: string;
            types?: string[];
          }>;
        }).addressComponents;
        const locality = getLocalityFromAddressComponents(addressComponents);
        onPlaceSelectRef.current?.({ formattedAddress, locality });

        // New session token for next autocomplete session (billing)
        setOptions({ key, v: "weekly" });
        const { AutocompleteSessionToken } = (await importLibrary(
          "places",
        )) as google.maps.PlacesLibrary & {
          AutocompleteSessionToken: new () => google.maps.places.AutocompleteSessionToken;
        };
        sessionTokenRef.current = new AutocompleteSessionToken();
      } catch (err) {
        console.error("Place details failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // No API key: plain input
  if (!key) {
    return (
      <Input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("", className)}
        autoComplete="off"
        {...props}
      />
    );
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={cn("pl-8", className)}
        autoComplete="off"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        role="combobox"
        {...props}
      />
      {isOpen && (suggestions.length > 0 || loading) && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Loading…
            </li>
          ) : (
            suggestions.map((s, i) => {
              const pred = s.placePrediction;
              const text = pred.text?.toString?.() ?? "";
              return (
                <li
                  key={i}
                  role="option"
                  aria-selected={false}
                  tabIndex={-1}
                  className="cursor-pointer px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(pred);
                  }}
                >
                  {text}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
