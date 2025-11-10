import { useCallback, useRef } from "react";

import { OptionsType } from "yz-fetch";

import useFetcher, { FetcherType } from "./useFetcher";

interface DebouncedFetcherConfig {
  options?: OptionsType;
  delay?: number;
}

export function useDebouncedFetcher<T>(type: FetcherType, config: DebouncedFetcherConfig = {}) {
  const { options, delay = 500 } = config;

  const fetcher = useFetcher<T>(type, options);

  const timerRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (url: string, options?: OptionsType) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      return new Promise<T | null>(resolve => {
        timerRef.current = setTimeout(async () => {
          const result = await fetcher(url, options);
          resolve(result);
        }, delay);
      });
    },
    [delay, fetcher],
  );
}
