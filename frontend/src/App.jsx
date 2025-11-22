import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import TeamsList from "./pages/TeamsList.jsx";
import TeamDetails from "./pages/TeamDetails.jsx"
import ProjectsList from "./pages/ProjectsList.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";

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
          <Route path="/teams/:id" element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />

          <Route path="/projects" element={<ProtectedRoute><ProjectsList /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
