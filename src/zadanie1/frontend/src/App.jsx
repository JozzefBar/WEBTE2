import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import AthletesPage from './pages/AthletesPage';
import AthleteDetailPage from './pages/AthleteDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

//safety for private zone -> login
function PrivateRoute({ children }){
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner-border text-danger"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

//Page for user that are not logged in /dashboard
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner-border text-danger"></div>
    </div>
  );
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<AthletesPage/>} />
      <Route path="/athlete/:id" element={<AthleteDetailPage />} />
      <Route path ="/login" element={
        <PublicOnlyRoute><LoginPage/></PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute><ProfilePage /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  );
}