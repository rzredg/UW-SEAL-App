import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import TeamsList from "./pages/TeamsList.jsx";
import TeamDetails from "./pages/TeamDetails.jsx";
import CreateTeam from "./pages/CreateTeam.jsx";
import ProjectsList from "./pages/ProjectsList.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import TaskDetails from "./pages/TaskDetails.jsx";
import CreateTask from "./pages/CreateTask.jsx";
import SealClanLife from "./pages/SealClanLife.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/teams" element={<ProtectedRoute><TeamsList /></ProtectedRoute>} />
          <Route path="/teams/new" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
          <Route path="/teams/:id" element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />

          <Route path="/projects" element={<ProtectedRoute><ProjectsList /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/projects/:projectId/tasks/new" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />

          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
          
          <Route path="/clan-life" element={<ProtectedRoute><SealClanLife /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}