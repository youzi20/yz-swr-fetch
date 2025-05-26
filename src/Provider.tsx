import { useMemo } from "react";
import { SWRConfig, SWRConfiguration } from "swr";

import { RequestClient, RequestClientConfig } from "yz-fetch";

export function Provider(props: {
  value: RequestClientConfig & {
    origin: string;
    children: React.ReactNode;
    config?: SWRConfiguration;
  };
}) {
  const { origin, config, baseUrl, debug, ...other } = props.value;

  const client = useMemo(() => new RequestClient({ baseUrl, debug }), [origin]);

  return (
    <SWRConfig
      value={{
        fetcher: client.request,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        ...config,
      }}
      {...other}
    />
  );
}

export default Provider;
