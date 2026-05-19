import { StrictMode, lazy, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

import Layout from "./Layout";
import App from "./App.jsx";
import usePageTracking from "./hooks/usePageTracking.js";

const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

function PageTracker() {
  usePageTracking();
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <PageTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/articles" element={<Suspense fallback={null}><ArticlesPage /></Suspense>} />
          <Route path="/articles/*" element={<Suspense fallback={null}><ArticlesPage /></Suspense>} />
          <Route path="/projects" element={<Suspense fallback={null}><ProjectsPage /></Suspense>} />
          <Route path="/projects/:slug" element={<Suspense fallback={null}><ProjectsPage /></Suspense>} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);