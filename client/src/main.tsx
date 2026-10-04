import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeAnalytics } from "./lib/analytics";

createRoot(document.getElementById("root")!).render(<App />);
initializeAnalytics();
