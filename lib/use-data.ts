"use client";
import { useEffect, useRef, useState } from "react";

/** Загрузка данных с состояниями loading / error / data (пустоту решает экран). deps — когда перезагружать. */
export function useData<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ loading: boolean; error: boolean; data: T | null }>({ loading: true, error: false, data: null });
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const key = JSON.stringify(deps);
  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start loading
    setState((s) => ({ ...s, loading: true, error: false }));
    loadRef.current()
      .then((data) => alive && setState({ loading: false, error: false, data }))
      .catch(() => alive && setState({ loading: false, error: true, data: null }));
    return () => {
      alive = false;
    };
  }, [key, tick]);
  return { ...state, retry: () => setTick((x) => x + 1) };
}
