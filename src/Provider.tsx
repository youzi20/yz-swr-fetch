import { useMemo } from "react";
import { SWRConfig, SWRConfiguration } from "swr";

import { RequestClient, RequestClientConfig } from "yz-fetch";

export default function Provider(
  props: RequestClientConfig & {
    origin: string;
    confige?: SWRConfiguration;
    children: React.ReactNode;
  }
) {
  const { origin, confige, baseUrl, debug, ...other } = props;

  const client = useMemo(() => new RequestClient({ baseUrl, debug }), [origin]);

  return (
    <SWRConfig
      value={{
        fetcher: client.request,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        ...confige,
      }}
      {...other}
    />
  );
}
