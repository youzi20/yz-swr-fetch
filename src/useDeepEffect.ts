import { useEffect, useRef } from "react";

export function useDeepEffect(effect: () => void | (() => void), deps: unknown[]) {
  const prevDeps = useRef<unknown[] | null>(null);

  useEffect(() => {
    if (prevDeps.current === null) {
      prevDeps.current = deps;
      return;
    }

    if (JSON.stringify(prevDeps.current) !== JSON.stringify(deps)) {
      prevDeps.current = deps;
      return effect();
    }
  }, deps);
}

export default useDeepEffect;
