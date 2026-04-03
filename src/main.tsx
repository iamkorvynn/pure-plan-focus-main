import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { MealProvider } from "@/contexts/MealContext";
import { HabitProvider } from "@/contexts/HabitContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { JournalProvider } from "@/contexts/JournalContext";

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <TaskProvider>
            <MealProvider>
                <HabitProvider>
                    <WorkoutProvider>
                        <JournalProvider>
                            <App />
                        </JournalProvider>
                    </WorkoutProvider>
                </HabitProvider>
            </MealProvider>
        </TaskProvider>
    </AuthProvider>
);