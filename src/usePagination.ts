import { useState, useEffect, useRef } from "react";

import { mutate } from "swr";

import { useDeepEffect } from "./useDeepEffect";
import useRequest, { RequestConfiguration } from "./useRequest";

interface PaginationDataResponse<T> {
  list: T[];
  totalCount: number;
  totalPage: number;
}

export interface PaginationResponse<T> {
  isEnd: boolean;
  isLoading: boolean;
  isValidating: boolean;
  data: T[] | null;
  nextPage: (endTime?: number) => void;
  update: (records: T[]) => void;
  onReload: () => void;
}

interface PaginationType {
  pageSize: number;
}

export function usePagination<T>(
  url: string,
  rowConfig: RequestConfiguration & { pagination?: PaginationType }
): PaginationResponse<T> {
  const [isEnd, setEnd] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [records, setRecords] = useState<T[] | null>(null);
  const recordRef = useRef<T[] | null>(null);

  const { pagination, options, ...otherConfig } = rowConfig;
  const { body, ...otherOption } = options ?? {};

  const config = {
    options: {
      body: { pageIndex, pageSize, endTime, ...body },
      ...otherOption,
    },
    ...otherConfig,
  };

  const {
    isLoading,
    isValidating,
    data,
    mutate: reload,
  } = useRequest<PaginationDataResponse<T>>(url, config);

  const handleClean = () => {
    mutate(url, undefined, { revalidate: false });
    setEnd(false);
    setEndTime(null);
    setRecords(null);
    setPageIndex(1);
  };

  useEffect(() => {
    if (isLoading || isValidating || !data || !data.list) return;

    if (pageIndex === 1) {
      recordRef.current = [...data.list];
      setRecords(recordRef.current);
    } else {
      if (data.list.length < pageSize) setEnd(true);

      recordRef.current = [...(records ?? []), ...data.list];
      setRecords(recordRef.current);
    }
  }, [isLoading, isValidating, data]);

  useDeepEffect(() => {
    if (pagination) setPageSize(pagination.pageSize);
  }, [pagination]);

  useDeepEffect(() => {
    handleClean();
  }, [rowConfig]);

  useEffect(() => {
    return () => {
      if (recordRef.current) handleClean();
    };
  }, []);

  return {
    isEnd,
    isLoading,
    isValidating,
    data: records,
    nextPage: endTime => {
      setPageIndex(index => index + 1);

      if (endTime) setEndTime(endTime);
    },
    onReload: () => {
      handleClean();
      reload();
    },
    update: records => setRecords(records),
  };
}
