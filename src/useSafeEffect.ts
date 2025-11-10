import { useEffect as useReactEffect, useRef } from "react";

export function useDeepEffect(effect: () => void | (() => void), deps: React.DependencyList) {
  const prevDeps = useRef<React.DependencyList | null>(null);

  useReactEffect(() => {
    if (JSON.stringify(prevDeps.current) !== JSON.stringify(deps)) {
      prevDeps.current = deps;
      return effect();
    }
  }, deps);
}

function useSafeEffect(effect: () => void | (() => void), deps: React.DependencyList) {
  const isFirstMountRef = useRef(true);

  useDeepEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    return effect();
  }, deps);
}

export const useEffect = /* @__PURE__ */ process.env.NEXT_PUBLIC_ENV === "DEV" ? useSafeEffect : useDeepEffect;

export const useEffectCleanup =
  /* @__PURE__ */ process.env.NEXT_PUBLIC_ENV === "DEV"
    ? (cleanupFn: () => void, deps: React.DependencyList = []) => {
        return useSafeEffect(() => cleanupFn, deps);
      }
    : (cleanupFn: () => void, deps: React.DependencyList = []) => {
        return useDeepEffect(() => cleanupFn, deps);
      };

export default useEffect;
