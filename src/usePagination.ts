import { useMemo, useRef, useState } from "react";

import { mutate } from "swr";

import { useEffect, useEffectCleanup } from "./useSafeEffect";
import useRequest, { RequestConfiguration } from "./useRequest";

import { mergeObjects } from "./helpers";

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

export interface PaginationType {
  pageSize: number;
}

export interface PaginationConfiguration extends RequestConfiguration {
  pagination?: PaginationType;
}

export function usePagination<T>(url: string, config: PaginationConfiguration): PaginationResponse<T> {
  const [isEnd, setEnd] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [records, setRecords] = useState<T[] | null>(null);
  const recordRef = useRef<T[] | null>(null);

  const { pagination, ...otherConfig } = config;

  // 合并配置
  const requestConfig = useMemo(() => {
    const pageBody = endTime ? { pageSize, endTime } : { pageIndex, pageSize };

    return mergeObjects({ options: { body: pageBody } }, otherConfig);
  }, [pageIndex, pageSize, endTime, otherConfig]);

  const { isLoading, isValidating, data, mutate: reload } = useRequest<PaginationDataResponse<T>>(url, requestConfig);

  const handleClean = () => {
    mutate(url, undefined, { revalidate: false });
    setEnd(false);
    setRecords(null);
    setEndTime(null);
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
  }, [isLoading, isValidating, data, pageIndex, pageSize, records]);

  useEffect(() => {
    if (pagination) setPageSize(pagination.pageSize);
  }, [pagination]);

  useEffectCleanup(() => handleClean(), []);

  return {
    isEnd,
    isLoading,
    isValidating,
    data: records,
    update: setRecords,
    onReload: handleClean,
    nextPage: (endTime?: number) => {
      if (endTime) {
        setEndTime(endTime);
      } else {
        setPageIndex(index => index + 1);
      }
    },
  };
}
