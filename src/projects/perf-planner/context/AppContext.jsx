import { useReducer, useEffect } from "react";
import { AppContext } from "./contextObject.js";
import { reducer, initialState } from "./reducer.js";
import { DEFAULT_SETTINGS } from "../lib/defaultSettings.js";
import { openDB, getAllPages, getAllVariations, getSettings, saveSettings } from "../lib/db.js";

export { AppContext };

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from IndexedDB on mount
  useEffect(() => {
    async function init() {
      await openDB();
      let pages = await getAllPages();
      let variations = await getAllVariations();

      // Ensure all variations have a resources array (migration for pre-v2 data)
      variations = variations.map((v) =>
        v.resources ? v : { ...v, resources: [] }
      );

      const activePageId = pages[0]?.id ?? null;
      const activeVariationId = activePageId
        ? (variations.find((v) => v.pageId === activePageId && v.isBaseline)?.id ??
           variations.find((v) => v.pageId === activePageId)?.id ??
           null)
        : null;

      // Load or seed settings
      let settings = await getSettings("global");
      if (!settings) {
        settings = { id: "global", ...DEFAULT_SETTINGS };
        await saveSettings(settings);
      }

      dispatch({
        type: "INIT_LOADED",
        payload: { pages, variations, activePageId, activeVariationId, settings },
      });
    }
    init();
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
