import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Login } from '../pages/Login/Login';
import { ReadingEntry } from '../pages/Reading/ReadingEntry';
import { CalculateReview } from '../pages/Calculate/CalculateReview';
import { HistoryCompare } from '../pages/History/HistoryCompare';
import { PrintView } from '../pages/Print/PrintView';
import { DispatcherDashboard } from '../pages/Dashboard/DispatcherDashboard';
import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return <Navigate to="/reading" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/reading" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading"
            element={
              <ProtectedRoute requiredRoles={['gauger']}>
                <ReadingEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculate"
            element={
              <ProtectedRoute requiredRoles={['gauger', 'agent']}>
                <CalculateReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryCompare />
              </ProtectedRoute>
            }
          />
          <Route
            path="/print/:id"
            element={
              <ProtectedRoute>
                <PrintView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRoles={['dispatcher']}>
                <DispatcherDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/reading" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
