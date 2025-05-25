import { useEffect, useRef } from "react";

export default function useDeepEffect(effect: () => void | (() => void), deps: unknown[]) {
  const prevDeps = useRef<unknown[]>([]);

  const hasChanged = JSON.stringify(prevDeps.current) !== JSON.stringify(deps);

  useEffect(() => {
    if (hasChanged) {
      prevDeps.current = deps;
      return effect();
    }
  }, [hasChanged]);
}
