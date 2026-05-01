import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Layout from "./Layout";
import App from "./App.jsx";

const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/articles" element={<Suspense fallback={null}><ArticlesPage /></Suspense>} />
          <Route path="/articles/:slug" element={<Suspense fallback={null}><ArticlesPage /></Suspense>} />
          <Route path="/projects" element={<Suspense fallback={null}><ProjectsPage /></Suspense>} />
          <Route path="/projects/:slug" element={<Suspense fallback={null}><ProjectsPage /></Suspense>} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);