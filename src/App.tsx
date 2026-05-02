import { Suspense, lazy }           from 'react';
import { Routes, Route, Navigate }  from 'react-router-dom';
import { useAuth }                  from './hooks/useAuth';
import { AppLayout }                from './components/layout/AppLayout';

// ─── Imports statiques — toujours chargés (petits, critiques) ─────────────────
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ─── Lazy imports — chargés à la demande par route ───────────────────────────
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const TasksPage        = lazy(() => import('./pages/TasksPage'));
const CalendarPage     = lazy(() => import('./pages/CalendarPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));

// ─── Guards ───────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Routes publiques — pas de lazy, chargées immédiatement */}
      <Route path="/login"    element={<PublicRoute><LoginPage    /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Routes protégées — lazy chargées à la première navigation */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={
          <Suspense fallback={null}>
            <DashboardPage />
          </Suspense>
        } />
        <Route path="/tasks" element={
          <Suspense fallback={null}>
            <TasksPage />
          </Suspense>
        } />
        <Route path="/calendar" element={
          <Suspense fallback={null}>
            <CalendarPage />
          </Suspense>
        } />
        <Route path="/gamification" element={
          <Suspense fallback={null}>
            <GamificationPage />
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={null}>
            <ProfilePage />
          </Suspense>
        } />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}