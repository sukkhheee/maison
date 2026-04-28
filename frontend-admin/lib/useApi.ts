"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "./api/client";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * Tiny replacement for SWR/react-query for the admin demo.
 *
 * <p>Reruns the fetcher whenever {@code deps} change; cancels stale results
 * by ignoring responses that resolve after a newer run started.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[]): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  const runRef = useRef(0);

  useEffect(() => {
    const myRun = ++runRef.current;
    setLoading(true);
    setError(null);
    fetcher()
      .then((value) => {
        if (runRef.current !== myRun) return;
        setData(value);
      })
      .catch((e) => {
        if (runRef.current !== myRun) return;
        const err =
          e instanceof ApiError
            ? e
            : new ApiError(0, "UNKNOWN", e?.message ?? "Алдаа гарлаа");
        setError(err);
      })
      .finally(() => {
        if (runRef.current !== myRun) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}
