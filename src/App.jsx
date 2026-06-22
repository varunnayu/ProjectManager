import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import Resources from "./pages/Resources";
import Logs from "./pages/Logs";
import AiAssistant from "./pages/AiAssistant";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Core App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all → back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;