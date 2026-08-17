import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import ProjectDetail from './pages/Projects/ProjectDetail';
import { MilestoneProvider } from './context/MilestoneContext';
import { ActivityProvider } from './context/ActivityContext';
import { ClientProvider } from './context/ClientContext';
import { TaskProvider } from './context/TaskContext';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import Categories from './pages/Categories/Categories';
import ProjectsPage from './pages/Projects/Projects';
import MilestonesPage from './pages/Milestones/Milestones';
import MilestoneDetail from './pages/Milestones/MilestoneDetail';
import KanbanPage from './pages/Kanban/Kanban';
import CalendarPage from './pages/Calendar/Calendar';
import TeamManagement from './pages/Team/TeamManagement';
import ClientsPage from './pages/Clients/Clients';
import ActivityLogPage from './pages/ActivityLog/ActivityLog';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/milestones/:id" element={<MilestoneDetail />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/activity" element={<ActivityLogPage />} />
        <Route path="/audit-log" element={<ActivityLogPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function PublicRoutes() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ProjectProvider>
            <MilestoneProvider>
              <ActivityProvider>
                <ClientProvider>
                  <TaskProvider>
                    <BrowserRouter>
                      <AppRoutes />
                    </BrowserRouter>
                  </TaskProvider>
                </ClientProvider>
              </ActivityProvider>
            </MilestoneProvider>
          </ProjectProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}