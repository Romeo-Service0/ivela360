import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, hasManagementAccess } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  Users,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { employee, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isManager = hasManagementAccess(employee?.role);

  const employeeLinks = [
    {
      href: '/dashboard/employee',
      label: 'Tableau de bord',
      icon: LayoutDashboard
    },
    {
      href: '/dashboard/employee/goal-setting',
      label: 'Contrat de Performance (CIP)',
      icon: Target
    },
    {
      href: '/dashboard/employee/appraisal-mid',
      label: 'Évaluation Mi-parcours',
      icon: ClipboardCheck
    },
    {
      href: '/dashboard/employee/appraisal-end',
      label: 'Évaluation Fin d\'année',
      icon: FileText
    },
  ];

  const managerLinks = [
    {
      href: '/dashboard/manager',
      label: 'Tableau de bord',
      icon: LayoutDashboard
    },
    {
      href: '/dashboard/manager/team',
      label: 'Mon Équipe',
      icon: Users
    },
  ];

  const links = isManager ? managerLinks : employeeLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleDisplayName = () => {
    if (!employee?.role) return '';
    return ROLE_LABELS[employee.role] || employee.role;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 ivela-gradient h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-primary-foreground"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">
            IVELA <span className="text-accent">360°</span>
          </h1>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground">
            IVELA <span className="text-accent">360°</span>
          </h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full ivela-gradient flex items-center justify-center text-primary-foreground font-semibold">
              {employee?.first_name?.[0]}{employee?.last_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {employee?.first_name} {employee?.last_name}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {getRoleDisplayName()}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
