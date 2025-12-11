import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import Navbar from '../components/layout/Navbar';

// Page imports
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import WorkspacesPage from '../pages/workspaces/WorkspacesPage';
import WorkspaceDetail from '../pages/workspaces/WorkspaceDetail';
import ProjectDetail from '../pages/projects/ProjectDetail';
import TaskDetail from '../pages/tasks/TaskDetail';

// Root layout that provides AuthContext to all routes
const RootLayout = () => {
  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
    </AuthProvider>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes - accessible without authentication
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      
      // Redirect root to login
      {
        path: '/',
        element: <Navigate to="/login" replace />
      },

      // Protected routes - require authentication
      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/workspaces',
            element: <WorkspacesPage />
          },
          {
            path: '/workspaces/:workspaceId',
            element: <WorkspaceDetail />
          },
          {
            path: '/workspaces/:workspaceId/projects/:projectId',
            element: <ProjectDetail />
          },
          {
            path: '/workspaces/:workspaceId/projects/:projectId/tasks/:taskId',
            element: <TaskDetail />
          }
        ]
      },

      // 404 fallback - redirect to login
      {
        path: '*',
        element: <Navigate to="/login" replace />
      }
    ]
  }
]);