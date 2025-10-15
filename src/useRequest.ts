import { useRef } from "react";
import useSWR, { SWRConfiguration } from "swr";

import { OptionsType } from "yz-fetch";

import useAuthStore from "./useAuthStore";
import useFetcher, { FetcherType } from "./useFetcher";
import useDeepEffect from "./useDeepEffect";

export interface RequestConfiguration {
  type?: FetcherType;
  options?: OptionsType;
  swrConfiguration?: SWRConfiguration;
}

export function useRequest<T>(url: string, config: RequestConfiguration = {}) {
  const { type = FetcherType.AUTH, options, swrConfiguration } = config;

  const fetcher = useFetcher<T>(type, options);
  const response = useSWR<T | null>(url, fetcher, swrConfiguration);

  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const isLogin = useAuthStore(state => state.isLogin);
  const authorization = useAuthStore(state => state.authorization);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleUpdate = () => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      response.mutate();
    }, 500);
  };

  useDeepEffect(() => {
    handleUpdate();
  }, [options]);

  useDeepEffect(() => {
    if (!hasHydrated) return;

    if (type !== FetcherType.PUBLIC) handleUpdate();
  }, [hasHydrated, type, authorization, isLogin]);

  return response;
}

export default useRequest;
