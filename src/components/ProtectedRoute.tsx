import { Navigate } from 'react-router-dom';
import { useAuth, hasManagementAccess } from '@/lib/auth';
import { EmployeeRole } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: EmployeeRole | 'any';
}

const ProtectedRoute = ({ children, requiredRole = 'any' }: ProtectedRouteProps) => {
  const { user, employee, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole !== 'any' && employee?.role !== requiredRole) {
    // Redirect based on actual role
    if (hasManagementAccess(employee?.role)) {
      return <Navigate to="/dashboard/manager" replace />;
    }
    return <Navigate to="/dashboard/employee" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
