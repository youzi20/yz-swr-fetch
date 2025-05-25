import { useCallback, useRef } from "react";
import useSWR, { SWRConfiguration } from "swr";

import { OptionsType } from "yz-fetch";

import useAuthStore from "./useAuthStore";
import useDeepEffect from "./useDeepEffect";
import useFetcher, { FetcherType } from "./useFetcher";

export interface RequestConfiguration {
  type?: FetcherType;
  options?: OptionsType;
  swrConfiguration?: SWRConfiguration;
}

export default function useRequest<T>(url: string, config: RequestConfiguration = {}) {
  const { type = FetcherType.AUTH, options, swrConfiguration } = config;

  const fetcher = useFetcher<T>(type, options);
  const response = useSWR<T | null>(url, fetcher, swrConfiguration);

  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const isLogin = useAuthStore(state => state.isLogin);
  const authorization = useAuthStore(state => state.authorization);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleUpdate = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      response.mutate();
    }, 500);
  }, [response]);

  useDeepEffect(() => {
    if (!hasHydrated || !options) return;

    handleUpdate();
  }, [hasHydrated, options, handleUpdate]);

  useDeepEffect(() => {
    if (!hasHydrated || !authorization) return;

    if (type === FetcherType.AUTH_CHECK) handleUpdate();
  }, [hasHydrated, authorization, type, handleUpdate]);

  useDeepEffect(() => {
    if (!hasHydrated || !isLogin) return;

    if ([FetcherType.PUBLIC_OR_AUTH, FetcherType.AUTH].includes(type)) handleUpdate();
  }, [hasHydrated, isLogin, type, handleUpdate]);

  return response;
}
