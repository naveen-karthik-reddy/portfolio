export const initialState = {
  dbReady: false,
  pages: [],
  variations: [],
  activePageId: null,
  activeVariationId: null,
  comparisonMode: false,
  comparisonVariationIds: [],
  settings: null,
};

export function reducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case "INIT_LOADED":
      return {
        ...state,
        dbReady: true,
        pages: payload.pages,
        variations: payload.variations,
        activePageId: payload.activePageId,
        activeVariationId: payload.activeVariationId,
        settings: payload.settings ?? null,
      };

    // ── Pages ────────────────────────────────────────────────────

    case "PAGE_CREATED":
      return { ...state, pages: [...state.pages, payload] };

    case "PAGE_CREATED_FROM_LIGHTHOUSE":
      return {
        ...state,
        pages: [...state.pages, payload.page],
        variations: [...state.variations, payload.baseline],
        activePageId: payload.page.id,
        activeVariationId: payload.baseline.id,
      };

    case "PAGE_RECALIBRATED": {
      const updatedPages = state.pages.map((p) =>
        p.id === payload.pageId
          ? { ...p, scoringCurves: payload.scoringCurves, calibration: payload.calibration, updatedAt: payload.updatedAt }
          : p
      );
      const updatedVariations = state.variations.map((v) => {
        if (v.pageId !== payload.pageId || !v.isBaseline) return v;
        return {
          ...v,
          pageMeta:  payload.baselinePageMeta  ?? v.pageMeta,
          resources: payload.baselineResources ?? v.resources,
          updatedAt: payload.updatedAt,
        };
      });
      return { ...state, pages: updatedPages, variations: updatedVariations };
    }

    case "PAGE_RENAMED":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === payload.id ? { ...p, name: payload.name, updatedAt: payload.updatedAt } : p
        ),
      };

    case "PAGE_DELETED": {
      const remainingPages = state.pages.filter((p) => p.id !== payload.id);
      const remainingVariations = state.variations.filter((v) => v.pageId !== payload.id);
      const nextPage = remainingPages[0] ?? null;
      const nextVariation = nextPage
        ? remainingVariations.find((v) => v.pageId === nextPage.id) ?? null
        : null;
      return {
        ...state,
        pages: remainingPages,
        variations: remainingVariations,
        activePageId: nextPage?.id ?? null,
        activeVariationId: nextVariation?.id ?? null,
      };
    }

    case "SET_ACTIVE_PAGE":
      return { ...state, activePageId: payload.pageId, activeVariationId: payload.variationId };

    // ── Variations ───────────────────────────────────────────────

    case "VARIATION_CREATED":
      return { ...state, variations: [...state.variations, payload] };

    case "VARIATION_RENAMED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.id ? { ...v, name: payload.name, updatedAt: payload.updatedAt } : v
        ),
      };

    case "VARIATION_DUPLICATED":
      return { ...state, variations: [...state.variations, payload] };

    case "VARIATION_DELETED": {
      const remaining = state.variations.filter((v) => v.id !== payload.id);
      let nextActiveId = state.activeVariationId;
      if (state.activeVariationId === payload.id) {
        const siblings = remaining.filter((v) => v.pageId === state.activePageId);
        nextActiveId = siblings[0]?.id ?? null;
      }
      return { ...state, variations: remaining, activeVariationId: nextActiveId };
    }

    case "VARIATION_SET_BASELINE":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.pageId === payload.pageId
            ? { ...v, isBaseline: v.id === payload.variationId }
            : v
        ),
      };

    case "SET_ACTIVE_VARIATION":
      return { ...state, activeVariationId: payload.id };

    // ── Page meta / resources ────────────────────────────────────

    case "PAGE_META_CHANGED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.variationId
            ? { ...v, pageMeta: { ...v.pageMeta, [payload.field]: payload.value }, updatedAt: new Date().toISOString() }
            : v
        ),
      };

    case "RESOURCE_FIELD_CHANGED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.variationId
            ? {
                ...v,
                resources: (v.resources ?? []).map((r) =>
                  r.id === payload.resourceId ? { ...r, [payload.field]: payload.value } : r
                ),
                updatedAt: new Date().toISOString(),
              }
            : v
        ),
      };

    case "LOCK_TOGGLED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.variationId
            ? { ...v, locked: { ...v.locked, [payload.key]: !v.locked?.[payload.key] } }
            : v
        ),
      };

    // ── Resources ────────────────────────────────────────────────

    case "RESOURCE_ADDED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.variationId
            ? { ...v, resources: [...(v.resources ?? []), payload.resource], updatedAt: new Date().toISOString() }
            : v
        ),
      };

    case "RESOURCE_UPDATED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.variationId
            ? {
                ...v,
                resources: (v.resources ?? []).map((r) =>
                  r.id === payload.resource.id ? payload.resource : r
                ),
                updatedAt: new Date().toISOString(),
              }
            : v
        ),
      };

    case "RESOURCE_DELETED":
      return {
        ...state,
        variations: state.variations.map((v) =>
          v.id === payload.variationId
            ? {
                ...v,
                resources: (v.resources ?? []).filter((r) => r.id !== payload.resourceId),
                updatedAt: new Date().toISOString(),
              }
            : v
        ),
      };

    // ── Settings ─────────────────────────────────────────────────

    case "SETTINGS_LOADED":
      return { ...state, settings: payload };

    case "SETTINGS_UPDATED":
      return { ...state, settings: payload };

    // ── Import ───────────────────────────────────────────────────

    case "PAGE_IMPORTED":
      return {
        ...state,
        pages: [...state.pages, payload.page],
        variations: [...state.variations, ...payload.variations],
        activePageId: payload.page.id,
        activeVariationId: payload.variations[0]?.id ?? null,
      };

    // ── Comparison ───────────────────────────────────────────────

    case "COMPARISON_OPENED":
      return { ...state, comparisonMode: true, comparisonVariationIds: [] };

    case "COMPARISON_CLOSED":
      return { ...state, comparisonMode: false, comparisonVariationIds: [] };

    case "COMPARISON_VARIATION_TOGGLED": {
      const ids = state.comparisonVariationIds;
      const already = ids.includes(payload.variationId);
      if (already) {
        return { ...state, comparisonVariationIds: ids.filter((id) => id !== payload.variationId) };
      }
      if (ids.length >= 4) return state; // max 4
      return { ...state, comparisonVariationIds: [...ids, payload.variationId] };
    }

    default:
      return state;
  }
}
