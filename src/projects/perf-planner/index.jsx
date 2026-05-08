import { useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { AppProvider } from "./context/AppContext.jsx";
import { useApp } from "./context/useApp.js";
import { computeMetrics, computeScores, PROFILES } from "./lib/calculator.js";
import { useAutoSave } from "./hooks/useAutoSave.js";
import TopBar from "./components/layout/TopBar.jsx";
import VariationTabs from "./components/layout/VariationTabs.jsx";
import PageMetaBar from "./components/input/PageMetaBar.jsx";
import ResourcePanel from "./components/resources/ResourcePanel.jsx";
import ImpactDashboard from "./components/dashboard/ImpactDashboard.jsx";
import ComparisonMode from "./components/comparison/ComparisonMode.jsx";
import SettingsPanel from "./components/settings/SettingsPanel.jsx";
import PageManager from "./components/pages/PageManager.jsx";
import CalibrationPanel from "./components/calibration/CalibrationPanel.jsx";

function PerfPlanner() {
  const { state } = useApp();
  const { dbReady, pages, variations, activeVariationId, activePageId, comparisonMode, settings } = state;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageManagerOpen, setPageManagerOpen] = useState(true);
  const [calibrationDialog, setCalibrationDialog] = useState({ open: false, mode: "create", pageId: null });

  // Derived values
  const activePage           = pages.find((p) => p.id === activePageId) ?? null;
  const activeVariation      = variations.find((v) => v.id === activeVariationId) ?? null;
  const activePageVariations = variations.filter((v) => v.pageId === activePageId);
  const baselineVariation    =
    activePageVariations.find((v) => v.isBaseline) ?? activePageVariations[0] ?? null;
  const isBaseline = activeVariation?.id === baselineVariation?.id;

  // Page-level calibrated curves take precedence over global settings curves
  const effectiveSettings = useMemo(() => (
    activePage?.scoringCurves
      ? { ...settings, scoringCurves: activePage.scoringCurves }
      : settings
  ), [settings, activePage?.scoringCurves]);

  // Auto-save active variation on every change (500ms debounce)
  useAutoSave(activeVariation);

  // Compute metrics + scores — aggregateInputs in calculator.js already
  // sums per-resource bytes and exec time, so no additive resourceImpact pass.
  const mobileProfile  = settings?.networkProfiles?.mobile  ?? PROFILES.mobile;
  const desktopProfile = settings?.networkProfiles?.desktop ?? PROFILES.desktop;
  const calibration    = activePage?.calibration ?? null;

  const mobileMetrics  = activeVariation
    ? computeMetrics(activeVariation.resources ?? [], activeVariation.pageMeta ?? {}, mobileProfile,  calibration)
    : null;
  const desktopMetrics = activeVariation
    ? computeMetrics(activeVariation.resources ?? [], activeVariation.pageMeta ?? {}, desktopProfile, calibration)
    : null;
  const mobileScores   = mobileMetrics  ? computeScores(mobileMetrics,  effectiveSettings) : null;
  const desktopScores  = desktopMetrics ? computeScores(desktopMetrics, effectiveSettings) : null;

  const baselineMobileMetrics  = (!isBaseline && baselineVariation)
    ? computeMetrics(baselineVariation.resources ?? [], baselineVariation.pageMeta ?? {}, mobileProfile,  calibration)
    : null;
  const baselineDesktopMetrics = (!isBaseline && baselineVariation)
    ? computeMetrics(baselineVariation.resources ?? [], baselineVariation.pageMeta ?? {}, desktopProfile, calibration)
    : null;

  // Tab scores for all active-page variations
  const tabScores = useMemo(() => {
    const result = {};
    activePageVariations.forEach((v) => {
      const m = computeMetrics(v.resources ?? [], v.pageMeta ?? {}, PROFILES.mobile, calibration);
      result[v.id] = computeScores(m, effectiveSettings).overall;
    });
    return result;
  }, [activePageVariations, calibration, effectiveSettings]);

  function openCalibration(mode, pageId) {
    setCalibrationDialog({ open: true, mode, pageId });
  }
  function closeCalibration() {
    setCalibrationDialog((c) => ({ ...c, open: false }));
  }

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
        <CalibrationPanel open={calibrationDialog.open} mode={calibrationDialog.mode} pageId={calibrationDialog.pageId} onClose={closeCalibration} />
      </Box>
    );
  }

  if (comparisonMode) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <TopBar
          onPagesOpen={() => setPageManagerOpen(true)}
          onSettingsOpen={() => setSettingsOpen(true)}
          onCalibrationOpen={openCalibration}
          simMobileScore={mobileScores?.overall}
          simDesktopScore={desktopScores?.overall}
        />
        <ComparisonMode />
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <CalibrationPanel open={calibrationDialog.open} mode={calibrationDialog.mode} pageId={calibrationDialog.pageId} onClose={closeCalibration} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh)", minHeight: 500 }}>
      <TopBar
        onPagesOpen={() => setPageManagerOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        onCalibrationOpen={openCalibration}
        simOverallScore={mobileScores?.overall}
      />
      <VariationTabs
        variations={activePageVariations}
        activeVariationId={activeVariationId}
        tabScores={tabScores}
      />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Resource editor — left 32% */}
        <Box sx={{ width: "32%", overflowY: "auto", borderRight: 1, borderColor: "divider", display: "flex", flexDirection: "column" }}>
          <PageMetaBar />
          <ResourcePanel />
        </Box>
        {/* Dashboard — right 68% */}
        <Box sx={{ width: "68%", overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <ImpactDashboard
            mobileMetrics={mobileMetrics}
            mobileScores={mobileScores}
            desktopMetrics={desktopMetrics}
            desktopScores={desktopScores}
            baselineMobileMetrics={baselineMobileMetrics}
            baselineDesktopMetrics={baselineDesktopMetrics}
            resources={activeVariation?.resources}
            pageMeta={activeVariation?.pageMeta}
            isBaseline={isBaseline}
            calibratedFormFactor={activePage?.calibration?.formFactor ?? null}
            calibration={calibration}
          />
        </Box>
      </Box>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CalibrationPanel open={calibrationDialog.open} mode={calibrationDialog.mode} pageId={calibrationDialog.pageId} onClose={closeCalibration} />
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
