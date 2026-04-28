import { useContext } from "react";
import { AppContext } from "./contextObject.js";

export function useApp() {
  return useContext(AppContext);
}
