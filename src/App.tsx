import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import ProfileCreate from "./pages/ProfileCreate";
import ProfileView from "./pages/ProfileView";
import ProfileEdit from "./pages/ProfileEdit";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// Admin Pages
import MasterDashboard from "./pages/admin/MasterDashboard";
import OrganizerDashboard from "./pages/admin/OrganizerDashboard";
import DirectorDashboard from "./pages/admin/DirectorDashboard";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/:token" element={<Register />} />

            {/* Protected Routes with AppLayout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              {/* Common Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/profile/me" element={<ProfileView />} />
              <Route path="/profile/:id" element={<ProfileView />} />

              {/* Organizer Admin Routes */}
              <Route path="/admin/organizer" element={
                <ProtectedRoute allowedRoles={['organizer_admin', 'master_admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/organizer/groups" element={
                <ProtectedRoute allowedRoles={['organizer_admin', 'master_admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />

              {/* Department Director Routes */}
              <Route path="/admin/director" element={
                <ProtectedRoute allowedRoles={['department_director', 'master_admin']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/director/team" element={
                <ProtectedRoute allowedRoles={['department_director', 'master_admin']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/director/info" element={
                <ProtectedRoute allowedRoles={['department_director', 'master_admin']}>
                  <DirectorDashboard />
                </ProtectedRoute>
              } />

              {/* Master Admin Routes */}
              <Route path="/admin/master" element={
                <ProtectedRoute allowedRoles={['master_admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/master/users" element={
                <ProtectedRoute allowedRoles={['master_admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/master/users/new" element={
                <ProtectedRoute allowedRoles={['master_admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/master/analytics" element={
                <ProtectedRoute allowedRoles={['master_admin']}>
                  <MasterDashboard />
                </ProtectedRoute>
              } />

              {/* Admin Settings (accessible to all admin roles) */}
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['master_admin']}>
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;