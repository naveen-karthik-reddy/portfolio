import { DEFAULT_SETTINGS } from "./defaultSettings.js";

const EXPORT_VERSION = 4;

function triggerDownload(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPageAsJSON(page, variations) {
  triggerDownload(
    `${page.name.replace(/\s+/g, "-").toLowerCase()}-perf-profile.json`,
    {
      exportVersion: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      page: {
        name: page.name,
        scoringCurves: page.scoringCurves ?? null,
        calibration:   page.calibration   ?? null,
      },
      variations: variations.map((v) => ({
        name: v.name,
        isBaseline: !!v.isBaseline,
        pageMeta: v.pageMeta ?? { ttfb: 0, cdn: false },
        resources: v.resources ?? [],
      })),
    }
  );
}

export function downloadSettingsAsJSON(settings) {
  triggerDownload("perf-planner-settings.json", { exportVersion: EXPORT_VERSION, type: "settings", settings });
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.exportVersion !== EXPORT_VERSION) {
          throw new Error("Export version not supported — please re-export from this version");
        }
        if (!data.page?.name) throw new Error("Missing page name");
        if (!Array.isArray(data.variations)) throw new Error("Missing variations array");

        const now       = new Date().toISOString();
        const newPageId = crypto.randomUUID();
        const page      = {
          id: newPageId,
          name: data.page.name,
          createdAt: now,
          updatedAt: now,
          scoringCurves: data.page.scoringCurves ?? null,
          calibration:   data.page.calibration   ?? null,
        };

        const variations = data.variations.map((v, i) => ({
          id: crypto.randomUUID(),
          pageId: newPageId,
          name: v.name ?? `Variation ${i + 1}`,
          isBaseline: v.isBaseline ?? i === 0,
          pageMeta: v.pageMeta ?? { ttfb: 0, cdn: false },
          resources: Array.isArray(v.resources) ? v.resources : [],
          createdAt: now,
          updatedAt: now,
        }));

        resolve({ page, variations });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file);
  });
}

export function parseSettingsFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.type !== "settings") throw new Error("Not a settings file");
        if (!data.settings) throw new Error("Missing settings object");
        const merged = {
          networkProfiles: { ...DEFAULT_SETTINGS.networkProfiles, ...data.settings.networkProfiles },
          scoringWeights:  { ...DEFAULT_SETTINGS.scoringWeights,  ...data.settings.scoringWeights  },
          scoringCurves:   { ...DEFAULT_SETTINGS.scoringCurves,   ...data.settings.scoringCurves   },
          connectionModel: { ...DEFAULT_SETTINGS.connectionModel, ...data.settings.connectionModel },
        };
        resolve(merged);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file);
  });
}
