import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// The macOS window uses an overlay titlebar, so the web topbar sits under the
// native traffic lights and needs to reserve room for them.
document.documentElement.dataset.platform = /Mac/i.test(navigator.userAgent)
  ? "macos"
  : "other";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
