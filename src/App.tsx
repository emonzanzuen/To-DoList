import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { MilestoneProvider } from './context/MilestoneContext';
import { ActivityProvider } from './context/ActivityContext';
import { ClientProvider } from './context/ClientContext';
import { TaskProvider } from './context/TaskContext';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import Categories from './pages/Categories/Categories';
import ProjectsPage from './pages/Projects/Projects';
import ProjectDetail from './pages/Projects/ProjectDetail';
import MilestonesPage from './pages/Milestones/Milestones';
import MilestoneDetail from './pages/Milestones/MilestoneDetail';
import KanbanPage from './pages/Kanban/Kanban';
import CalendarPage from './pages/Calendar/Calendar';
import TeamManagement from './pages/Team/TeamManagement';
import ClientsPage from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import ActivityLogPage from './pages/ActivityLog/ActivityLog';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';
import { readStorage } from './utils/storage';

const COMPANY_KEY = 'app_company_profile';
const DEFAULT_TITLE = 'To-Do List';

function updateDocumentBranding() {
  try {
    const data = readStorage<unknown>(COMPANY_KEY, null);

    if (!data || typeof data !== 'object') {
      document.title = DEFAULT_TITLE;
      return;
    }

    const profile = data as Record<string, unknown>;
    const companyName = typeof profile.name === 'string' ? profile.name.trim() : '';
    const logoUrl = typeof profile.logoUrl === 'string' ? profile.logoUrl.trim() : '';

    // Update browser tab title
    document.title = companyName || DEFAULT_TITLE;

    // Update favicon
    if (logoUrl) {
      let favicon = document.querySelector<HTMLLinkElement>('link#dynamic-favicon');

      // Jika link favicon belum ada di index.html, buat otomatis
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.id = 'dynamic-favicon';
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }

      favicon.type = logoUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
      favicon.href = logoUrl;
    }
  } catch {
    document.title = DEFAULT_TITLE;
  }
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading screen saat auth initialize dari localStorage
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/milestones/:id" element={<MilestoneDetail />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/activity" element={<ActivityLogPage />} />
        <Route path="/audit-log" element={<ActivityLogPage />} />
        <Route path="/settings" element={<Settings />} />

        {/* Redirect /login ke dashboard jika sudah login */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    updateDocumentBranding();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === COMPANY_KEY) {
        updateDocumentBranding();
      }
    };

    const handleFocus = () => {
      updateDocumentBranding();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateDocumentBranding();
      }
    };

    const handleCompanyProfileUpdated = () => {
      updateDocumentBranding();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('company-profile-updated', handleCompanyProfileUpdated);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('company-profile-updated', handleCompanyProfileUpdated);
    };
  }, []);

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