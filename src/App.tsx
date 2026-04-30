import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }                 from './hooks/useAuth';
import { AppLayout }               from './components/layout/AppLayout';
import LoginPage                   from './pages/LoginPage';
import RegisterPage                from './pages/RegisterPage';
import DashboardPage               from './pages/DashboardPage';
import TasksPage                   from './pages/TasksPage';
import CalendarPage                from './pages/CalendarPage';
import GamificationPage            from './pages/GamificationPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login"    element={<PublicRoute><LoginPage    /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Routes protégées avec layout */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard"    element={<DashboardPage    />} />
        <Route path="/tasks"        element={<TasksPage        />} />
        <Route path="/calendar"     element={<CalendarPage     />} />
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}