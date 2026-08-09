import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
// Self-hosted (offline, no CDN) — weight-axis-only variable Inter, all
// script subsets. The webview loads only the subset files a rendered
// page's unicode-range actually needs.
import "@fontsource-variable/inter/wght.css";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('root element not found — index.html is missing <div id="root">');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
