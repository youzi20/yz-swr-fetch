import { useCallback } from "react";
import { useSWRConfig } from "swr";

import { RequestClient, OptionsType } from "yz-fetch";

import { useAuthStore } from "./useAuthStore";

export enum FetcherType {
  PUBLIC = "PUBLIC", // 不需要登录
  AUTH_CHECK = "AUTH_CHECK", // 校验 Token
  PUBLIC_OR_AUTH = "PUBLIC_OR_AUTH", // 不需要登录 或者 需要Token
  AUTH = "AUTH", // 需要Token
}

export function useFetcher<T>(type: FetcherType, options?: OptionsType) {
  const fetcher = useSWRConfig().fetcher as RequestClient["request"];

  const isLogin = useAuthStore(state => state.isLogin);
  const authorization = useAuthStore(state => state.authorization);
  const logout = useAuthStore(state => state.logout);

  return useCallback(
    async (url: string, _options?: OptionsType) => {
      var { headers, handleErrorMessage, ...other } = _options ?? options ?? {};

      if (type === FetcherType.PUBLIC_OR_AUTH && authorization) {
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
    [authorization, isLogin, type, options, fetcher]
  );
}

export default useFetcher;
