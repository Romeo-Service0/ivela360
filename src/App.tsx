import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/AuthPage";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import GoalSettingForm from "./pages/dashboard/GoalSettingForm";
import AppraisalForm from "./pages/dashboard/AppraisalForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Employee Routes */}
            <Route
              path="/dashboard/employee"
              element={
                <ProtectedRoute>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/employee/goal-setting"
              element={
                <ProtectedRoute>
                  <GoalSettingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/employee/appraisal-mid"
              element={
                <ProtectedRoute>
                  <AppraisalForm type="mid-year" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/employee/appraisal-end"
              element={
                <ProtectedRoute>
                  <AppraisalForm type="end-year" />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/dashboard/manager"
              element={
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
