import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CompanyGate } from "@/components/auth/CompanyGate";
import { AppLayout } from "@/components/layout/AppLayout";
import { AmbientBackground } from "@/components/brand/AmbientBackground";
import { AsteriskPreloader } from "@/components/brand/AsteriskPreloader";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import ProfileCreate from "./pages/ProfileCreate";
import ProfileView from "./pages/ProfileView";
import ProfileEdit from "./pages/ProfileEdit";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import CompanyCreate from "./pages/company/CompanyCreate";
import CompanyJoin from "./pages/company/CompanyJoin";
import OrgChart from "./pages/OrgChart";
import Celebrations from "./pages/Celebrations";
import Kudos from "./pages/Kudos";
import Events from "./pages/Events";
import Documents from "./pages/Documents";
import Policies from "./pages/Policies";

// Admin Pages
import MasterDashboard from "./pages/admin/MasterDashboard";
import OrganizerDashboard from "./pages/admin/OrganizerDashboard";
import DirectorDashboard from "./pages/admin/DirectorDashboard";
import AdminSettings from "./pages/admin/AdminSettings";

// Services Pages
import ServicesLayout from "./pages/services/ServicesLayout";
import ServicesList from "./pages/services/ServicesList";
import ServiceCreate from "./pages/services/ServiceCreate";
import ServiceDetail from "./pages/services/ServiceDetail";
import ServiceEdit from "./pages/services/ServiceEdit";

const queryClient = new QueryClient();

const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSmoothScroll();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SmoothScrollProvider>
      <AmbientBackground />
      <AsteriskPreloader />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/:token" element={<Register />} />
            <Route path="/c/:slug/join" element={<CompanyJoin />} />

            {/* Company creation (auth-only, before company gate) */}
            <Route path="/company/create" element={
              <ProtectedRoute>
                <CompanyCreate />
              </ProtectedRoute>
            } />

            {/* Protected Routes with AppLayout (require company) */}
            <Route element={
              <ProtectedRoute>
                <CompanyGate>
                  <AppLayout />
                </CompanyGate>
              </ProtectedRoute>
            }>
              {/* Common Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/profile/me" element={<ProfileView />} />
              <Route path="/profile/:id" element={<ProfileView />} />
              <Route path="/org-chart" element={<OrgChart />} />
              <Route path="/people/celebrations" element={<Celebrations />} />
              <Route path="/kudos" element={<Kudos />} />
              <Route path="/events" element={<Events />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/policies" element={<Policies />} />

              {/* Organizer Admin Routes */}
              <Route path="/admin/organizer" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/organizer/groups" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />

              {/* Department Director Routes */}
              <Route path="/admin/director" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/director/team" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/director/info" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />

              {/* Master Admin Routes */}
              <Route path="/admin/master" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/master/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/master/users/new" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/master/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />

              {/* Services Module */}
              <Route path="/services" element={<ServicesLayout />}>
                <Route index element={<ServicesList />} />
                <Route path="create" element={<ServiceCreate />} />
                <Route path=":id" element={<ServiceDetail />} />
                <Route path=":id/edit" element={<ServiceEdit />} />
              </Route>

              {/* Admin Settings (accessible to all admin roles) */}
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
            </Route>

            {/* Profile Create (outside AppLayout for full-screen wizard) */}
            <Route path="/profile/create" element={
              <ProtectedRoute>
                <ProfileCreate />
              </ProtectedRoute>
            } />

            {/* Profile Edit (outside AppLayout for full-screen wizard) */}
            <Route path="/profile/:id/edit" element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            } />

            {/* Error Routes */}
            <Route path="/403" element={<Forbidden />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </SmoothScrollProvider>
  </QueryClientProvider>
);

export default App;