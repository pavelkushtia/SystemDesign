import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Layout components
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Authentication components
import AuthGuard from '@/components/auth/AuthGuard';
import AuthPage from '@/pages/AuthPage';

// Lazy-loaded pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const SystemDesigner = React.lazy(() => import('@/pages/SystemDesigner'));
const PatternLibrary = React.lazy(() => import('@/pages/PatternLibrary'));
const ServiceBuilder = React.lazy(() => import('@/pages/ServiceBuilder'));
const MLModelBuilder = React.lazy(() => import('@/pages/MLModelBuilder'));
const Simulation = React.lazy(() => import('@/pages/Simulation'));
const Deployment = React.lazy(() => import('@/pages/Deployment'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// User-specific pages
const UserProfile = React.lazy(() => import('@/pages/UserProfile'));

function App() {
  return (
    <>
      <Helmet>
        <title>ScaleSim - Visual Studio for Distributed Systems</title>
        <meta name="description" content="Design, simulate, and deploy distributed systems and ML infrastructure visually" />
      </Helmet>
      
      <Routes>
        {/* Public authentication routes */}
        <Route 
          path="/auth" 
          element={
            <AuthGuard requireAuth={false}>
              <AuthPage />
            </AuthGuard>
          } 
        />
        
        {/* Protected application routes */}
        <Route 
          path="/*" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Main application routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/designer" element={<SystemDesigner />} />
                    <Route path="/designer/:systemId" element={<SystemDesigner />} />
                    <Route path="/patterns" element={<PatternLibrary />} />
                    <Route path="/builders/services" element={<ServiceBuilder />} />
                    <Route path="/builders/ml-models" element={<MLModelBuilder />} />
                    <Route path="/simulation" element={<Simulation />} />
                    <Route path="/simulation/:systemId" element={<Simulation />} />
                    <Route path="/deployment" element={<Deployment />} />
                    <Route path="/deployment/:systemId" element={<Deployment />} />
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* User-specific routes */}
                    <Route path="/profile" element={<UserProfile />} />
                    
                    {/* 404 fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
      </Routes>
    </>
  );
}

export default App; 