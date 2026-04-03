import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { MealProvider } from "@/contexts/MealContext";

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <TaskProvider>
            <MealProvider>
                <App />
            </MealProvider>
        </TaskProvider>
    </AuthProvider>
);