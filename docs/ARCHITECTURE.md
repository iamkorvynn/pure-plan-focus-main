# 🏗️ Architecture Guide

This document provides a deep dive into the technical architecture of the **Pure-Plan-Focus** project.

---

## 📐 High-Level Overview

The application is built on a modern, reactive stack designed for high performance and scalability. It follows a **client-heavy architecture** with a powerful backend-as-a-service (BaaS) for data persistence and authentication.

```mermaid
graph TD
    subgraph Frontend (React + Vite)
        UI[User Interface - Shadcn/Tailwind]
        State[State Management - Context & Query]
        Hooks[Custom Hooks - useSupabaseData]
    end
    
    subgraph Backend (Supabase)
        Auth[Authentication]
        DB[(PostgreSQL Database)]
        Storage[Edge Storage]
    end

    UI <--> State
    State <--> Hooks
    Hooks <--> Auth
    Hooks <--> DB
```

---

## 📁 Directory Structure

- **`src/components`**: Modular UI components.
  - **`ui`**: Low-level foundation components (Radix UI/Shadcn).
  - **`dashboard`**: Core application features (Task Manager, Calendar, etc.).
- **`src/contexts`**: Global state management using React Context API.
  - `AuthContext`: Handles user sessions and authentication state.
  - `TaskContext`, `HabitContext`, `WorkoutContext`, `MealContext`: Domain-specific state.
- **`src/hooks`**: Custom hooks for shared logic, including `useSupabaseData` for data fetching.
- **`src/integrations`**: Configuration for external services (Supabase, Lovable).
- **`supabase/migrations`**: PostgreSQL schema definitions and evolution.

---

## 🧠 State Management

We use a multi-tiered approach to state management:

1. **Global State (Context API)**: Used for managing long-lived data like authentication and shared business logic across complex features (e.g., Task and Workout contexts).
2. **Server State (TanStack Query)**: Used for data fetching, caching, and synchronization with the Supabase database. This ensures a responsive UI and minimizes redundant API calls.
3. **Local State (useState/useReducer)**: Used for ephemeral UI state (e.g., modal visibility, form inputs).

---

## 🎨 Styling & Design System

The application uses **Tailwind CSS** for styling, following a **Utility-First** approach.
- **Theming**: Integrated with `next-themes` for seamless dark/light mode support.
- **Animations**: Powered by `tailwindcss-animate` and CSS transitions for a premium, glassmorphic feel.
- **Components**: Derived from **Shadcn UI**, providing accessible and highly customizable components based on Radix UI primitives.

---

## 🔗 Data Flow

1. **Action**: User interacts with a component (e.g., creates a task).
2. **Logic**: The component calls a function from a domain-specific **Context** (e.g., `addTask`).
3. **API**: The Context uses a custom **Hook** or the Supabase client to send a request to the backend.
4. **Update**: Upon success, **TanStack Query** invalidates relevant caches, or the Context updates its internal state.
5. **Re-render**: The UI reactively updates to reflect the latest data.

---

## 🔐 Security

- **Authentication**: Managed by Supabase Auth (JWT-based).
- **Authorization**: Enforced via **Row Level Security (RLS)** in PostgreSQL, ensuring users can only access their own data.
- **Environment Variables**: Sensitive keys are managed via `.env` files and never committed to the repository.
