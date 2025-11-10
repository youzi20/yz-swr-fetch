import { createContext, useCallback, useContext, useMemo } from "react";

import { SWRConfig, SWRConfiguration } from "swr";

import { OptionsType, RequestClient, RequestClientConfig } from "yz-fetch";

interface FetcherProviderValue {
  options?: OptionsType;
  enabled?: boolean;
  onRequest?: (url: string, options?: OptionsType) => { url: string; options?: OptionsType };
}

const Fetcher = createContext<FetcherProviderValue>({});

export const useFetcherContext = () => useContext(Fetcher);

export function FetcherProvider(props: {
  value: RequestClientConfig & FetcherProviderValue & { config?: SWRConfiguration };
  children: React.ReactNode;
}) {
  const {
    value: { baseUrl, debug, config, ...fetcherContext },
    children,
  } = props;

  const client = useMemo(() => new RequestClient({ baseUrl, debug }), [baseUrl, debug]);

  const fetcher = useCallback(
    (url: string, options?: OptionsType) => {
      if (fetcherContext.onRequest) {
        const res = fetcherContext.onRequest(url, options);
        url = res.url;
        options = res.options;
      }

      return client.request(url, options);
    },
    [client, fetcherContext.onRequest],
  );

  return (
    <Fetcher.Provider value={{ ...fetcherContext }}>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          keepPreviousData: true,
          ...config,
        }}
      >
        {children}
      </SWRConfig>
    </Fetcher.Provider>
  );
}

export default FetcherProvider;
