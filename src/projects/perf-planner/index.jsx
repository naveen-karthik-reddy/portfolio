import { useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { AppProvider } from "./context/AppContext.jsx";
import { useApp } from "./context/useApp.js";
import { computeMetrics, computeScores, computeRoadmap, PROFILES } from "./lib/calculator.js";
import { computeResourceImpact } from "./lib/resourceSimulator.js";
import { useAutoSave } from "./hooks/useAutoSave.js";
import TopBar from "./components/layout/TopBar.jsx";
import VariationTabs from "./components/layout/VariationTabs.jsx";
import InputPanel from "./components/input/InputPanel.jsx";
import ImpactDashboard from "./components/dashboard/ImpactDashboard.jsx";
import OptimizationRoadmap from "./components/roadmap/OptimizationRoadmap.jsx";
import ComparisonMode from "./components/comparison/ComparisonMode.jsx";
import SettingsPanel from "./components/settings/SettingsPanel.jsx";
import PageManager from "./components/pages/PageManager.jsx";

function PerfPlanner() {
  const { state } = useApp();
  const { dbReady, variations, activeVariationId, activePageId, comparisonMode, settings } = state;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageManagerOpen, setPageManagerOpen] = useState(true);

  // Derived values
  const activeVariation      = variations.find((v) => v.id === activeVariationId) ?? null;
  const activePageVariations = variations.filter((v) => v.pageId === activePageId);
  const baselineVariation    =
    activePageVariations.find((v) => v.isBaseline) ?? activePageVariations[0] ?? null;
  const isBaseline = activeVariation?.id === baselineVariation?.id;

  // Auto-save active variation on every change (500ms debounce)
  useAutoSave(activeVariation);

  // Resource impact from the resource list
  const mobileResourceImpact  = activeVariation
    ? computeResourceImpact(activeVariation.inputs, activeVariation.resources ?? [], "mobile",  settings)
    : null;
  const desktopResourceImpact = activeVariation
    ? computeResourceImpact(activeVariation.inputs, activeVariation.resources ?? [], "desktop", settings)
    : null;

  // Compute metrics + scores
  const mobileProfile  = settings?.networkProfiles?.mobile  ?? PROFILES.mobile;
  const desktopProfile = settings?.networkProfiles?.desktop ?? PROFILES.desktop;

  const mobileMetrics  = activeVariation ? computeMetrics(activeVariation.inputs, mobileProfile,  mobileResourceImpact)  : null;
  const desktopMetrics = activeVariation ? computeMetrics(activeVariation.inputs, desktopProfile, desktopResourceImpact) : null;
  const mobileScores   = mobileMetrics  ? computeScores(mobileMetrics,  settings) : null;
  const desktopScores  = desktopMetrics ? computeScores(desktopMetrics, settings) : null;

  const baselineMobileMetrics  = (!isBaseline && baselineVariation)
    ? computeMetrics(baselineVariation.inputs, mobileProfile)  : null;
  const baselineDesktopMetrics = (!isBaseline && baselineVariation)
    ? computeMetrics(baselineVariation.inputs, desktopProfile) : null;

  // Roadmap — keyed on activeVariation so it recomputes only when inputs/locks change
  const roadmapItems = useMemo(() => {
    if (!activeVariation) return [];
    const mSc = computeScores(computeMetrics(activeVariation.inputs, PROFILES.mobile), settings);
    const dSc = computeScores(computeMetrics(activeVariation.inputs, PROFILES.desktop), settings);
    return computeRoadmap(activeVariation.inputs, activeVariation.locked, mSc, dSc, settings);
  }, [activeVariation, settings]);

  // Tab scores for all active-page variations
  const tabScores = useMemo(() => {
    const result = {};
    activePageVariations.forEach((v) => {
      const m = computeMetrics(v.inputs, PROFILES.mobile);
      result[v.id] = computeScores(m, settings).overall;
    });
    return result;
  }, [activePageVariations, settings]);

  if (!dbReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  // Page manager view — also force-open when no pages exist
  if (pageManagerOpen || state.pages.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <PageManager onClose={() => setPageManagerOpen(false)} />
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </Box>
    );
  }

  if (comparisonMode) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <TopBar onPagesOpen={() => setPageManagerOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />
        <ComparisonMode />
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", minHeight: 500 }}>
      <TopBar onPagesOpen={() => setPageManagerOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />
      <VariationTabs
        variations={activePageVariations}
        activeVariationId={activeVariationId}
        tabScores={tabScores}
      />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Input panel — left 40% */}
        <Box sx={{ width: "40%", overflowY: "auto", borderRight: 1, borderColor: "divider" }}>
          <InputPanel />
        </Box>
        {/* Dashboard + roadmap — right 60% */}
        <Box sx={{ width: "60%", overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <ImpactDashboard
            mobileMetrics={mobileMetrics}
            mobileScores={mobileScores}
            desktopMetrics={desktopMetrics}
            desktopScores={desktopScores}
            baselineMobileMetrics={baselineMobileMetrics}
            baselineDesktopMetrics={baselineDesktopMetrics}
            inputs={activeVariation?.inputs}
            isBaseline={isBaseline}
          />
          <OptimizationRoadmap items={roadmapItems} />
        </Box>
      </Box>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}

export default function PerfPlannerRoot() {
  return (
    <AppProvider>
      <PerfPlanner />
    </AppProvider>
  );
}
