import { useEffect, useRef } from "react";
import { saveVariation } from "../lib/db.js";

export function useAutoSave(variation) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!variation) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveVariation(variation);
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [variation]);
}
