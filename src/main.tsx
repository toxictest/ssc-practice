import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MotionConfig } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineStatus from "./components/OfflineStatus";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user"><App /><OfflineStatus /></MotionConfig>
    </ErrorBoundary>
  </StrictMode>
);
