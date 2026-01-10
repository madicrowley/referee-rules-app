import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// This imports the component you created earlier
import App from "./app";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
