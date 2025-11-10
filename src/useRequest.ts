import { useMemo, useRef } from "react";

import useSWR, { KeyedMutator, SWRConfiguration } from "swr";

import { OptionsType } from "yz-fetch";

import { useFetcherContext } from "./Provider";

import useAuthStore from "./useAuthStore";
import useEffect from "./useSafeEffect";
import useFetcher, { FetcherType } from "./useFetcher";

export interface RequestConfiguration {
  type?: FetcherType;
  options?: OptionsType;
  enabled?: boolean;
  swrConfiguration?: SWRConfiguration;
}

export function useRequest<T>(url: string, config: RequestConfiguration = {}) {
  const { type = FetcherType.AUTH, options, swrConfiguration } = config;

  const fetcherContext = useFetcherContext();

  const enabled = useMemo(() => (fetcherContext.enabled ?? true) && (config.enabled ?? true), [fetcherContext, config]);

  const fetcher = useFetcher<T>(type, options);
  const { mutate, ...response } = useSWR<T | null>(enabled ? url : null, fetcher, swrConfiguration);

  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const isLogin = useAuthStore(state => state.isLogin);
  const authorization = useAuthStore(state => state.authorization);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleUpdate: KeyedMutator<T | null> = (...args) => {
    if (timer.current) clearTimeout(timer.current);
    console.log("========> handleUpdate", enabled, url);

    return new Promise(resolve => {
      timer.current = setTimeout(async () => {
        resolve(await mutate(...args));
      }, 500);
    });
  };

  useEffect(() => {
    handleUpdate();
  }, [options]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (type !== FetcherType.PUBLIC) handleUpdate();
  }, [hasHydrated, type, authorization, isLogin]);

  return { ...response, mutate: handleUpdate };
}

export default useRequest;
