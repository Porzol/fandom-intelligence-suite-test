import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Coach from './pages/Coach';
import Testing from './pages/Testing';
import Simulator from './pages/Simulator';
import Creators from './pages/Creators';
import Team from './pages/Team';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="insights" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.OPS_ANALYST]}>
              <Insights />
            </ProtectedRoute>
          } />
          <Route path="coach" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER]}>
              <Coach />
            </ProtectedRoute>
          } />
          <Route path="testing" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.OPS_ANALYST]}>
              <Testing />
            </ProtectedRoute>
          } />
          <Route path="simulator" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER]}>
              <Simulator />
            </ProtectedRoute>
          } />
          <Route path="creators" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Creators />
            </ProtectedRoute>
          } />
          <Route path="team" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Team />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
