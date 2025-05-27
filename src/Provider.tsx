import { useMemo } from "react";
import { SWRConfig, SWRConfiguration } from "swr";

import { RequestClient, RequestClientConfig } from "yz-fetch";

export function Provider(props: {
  value: RequestClientConfig & { config?: SWRConfiguration };
  children: React.ReactNode;
}) {
  const {
    value: { baseUrl, debug, config },
    children,
  } = props;

  const client = useMemo(() => new RequestClient({ baseUrl, debug }), [baseUrl, debug]);

  return (
    <SWRConfig
      value={{
        fetcher: client.request.bind(client),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        ...config,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export default Provider;
