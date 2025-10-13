import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🧪 TEST: Ejecutar parsers automáticamente
import { executeParserTests } from "./lib/parsers/testRunner";

createRoot(document.getElementById("root")!).render(<App />);

// 🧪 Ejecutar pruebas de parsers
executeParserTests().catch(console.error);