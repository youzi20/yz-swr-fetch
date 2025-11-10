import { useCallback } from "react";

import { useSWRConfig } from "swr";

import { OptionsType, RequestClient } from "yz-fetch";

import { useFetcherContext } from "./Provider";

import { useAuthStore } from "./useAuthStore";

import { mergeObjects } from "./helpers";

export enum FetcherType {
  PUBLIC = "PUBLIC", // 不需要登录
  AUTH_CHECK = "AUTH_CHECK", // 校验 Token
  PUBLIC_OR_AUTH = "PUBLIC_OR_AUTH", // 不需要登录 或者 需要Token
  AUTH = "AUTH", // 需要Token
}

export function useFetcher<T>(type: FetcherType, options?: OptionsType) {
  const fetcher = useSWRConfig().fetcher as RequestClient["request"];

  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const isLogin = useAuthStore(state => state.isLogin);
  const authorization = useAuthStore(state => state.authorization);
  const logout = useAuthStore(state => state.logout);

  const fetcherContext = useFetcherContext();

  return useCallback(
    async (url: string, _options?: OptionsType) => {
      var { headers, handleErrorMessage, ...other } = mergeObjects(fetcherContext.options, options, _options);

      if (type !== FetcherType.PUBLIC && !hasHydrated) return null;

      if (type === FetcherType.PUBLIC_OR_AUTH && authorization) {
        if (!isLogin) return null;

        headers = { authorization, ...headers };
      }

      if (type === FetcherType.AUTH_CHECK) {
        if (!authorization) return null;

        headers = { authorization, ...headers };
      }

      if (type === FetcherType.AUTH) {
        if (!isLogin || !authorization) return null;

        headers = { authorization, ...headers };
      }

      return fetcher<T>(url, {
        headers,
        handleErrorMessage: res => {
          if (res.code === 401) logout();
          handleErrorMessage?.(res);
        },
        ...other,
      });
    },
    [hasHydrated, authorization, isLogin, type, options, fetcher],
  );
}

export default useFetcher;
