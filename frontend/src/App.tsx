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
const MonitoringDashboard = React.lazy(() => import('@/pages/MonitoringDashboard'));
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
        {/* Test route to bypass auth issues */}
        <Route 
          path="/test" 
          element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>🎉 ScaleSim Test Page</h1>
              <p>If you can see this, the frontend is working!</p>
              <p>Backend status: <span id="backend-status">Checking...</span></p>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ 
                  padding: '0.5rem 1rem', 
                  margin: '1rem', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Clear Storage & Reload
              </button>
              <script dangerouslySetInnerHTML={{
                __html: `
                  fetch('/api/health')
                    .then(r => r.json())
                    .then(d => document.getElementById('backend-status').textContent = d.status)
                    .catch(e => document.getElementById('backend-status').textContent = 'Error: ' + e.message);
                `
              }} />
            </div>
          } 
        />
        
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
          path="/dashboard" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/designer" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <SystemDesigner />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/designer/:systemId" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <SystemDesigner />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/patterns" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <PatternLibrary />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/builders/services" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <ServiceBuilder />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/builders/ml-models" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <MLModelBuilder />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/simulation" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Simulation />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/simulation/:systemId" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Simulation />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/deployment" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Deployment />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/deployment/:systemId" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Deployment />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/monitoring" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <MonitoringDashboard />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/monitoring/:systemId" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <MonitoringDashboard />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <AuthGuard requireAuth={true}>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <UserProfile />
                </Suspense>
              </MainLayout>
            </AuthGuard>
          } 
        />
        
        {/* Root redirect */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* 404 fallback */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <NotFound />
            </Suspense>
          } 
        />
      </Routes>
    </>
  );
}

export default App; 