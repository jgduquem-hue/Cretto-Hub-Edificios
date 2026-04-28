import React from "react";
import ReactDOM from "react-dom/client";
import "./storage-shim.js";
import CrettoApp from "./CrettoHub.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CrettoApp />
  </React.StrictMode>
);
