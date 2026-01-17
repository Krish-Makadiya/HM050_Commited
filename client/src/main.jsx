import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </ClerkProvider>
    </BrowserRouter>
);
