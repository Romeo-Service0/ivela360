import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ClipboardCheck, FileText, Calendar, ArrowRight } from 'lucide-react';

const EmployeeDashboard = () => {
  const { employee } = useAuth();

  const cards = [
    {
      title: 'Contrat Individuel de Performance',
      description: 'Définir vos objectifs pour le cycle 2026',
      icon: Target,
      href: '/dashboard/employee/goal-setting',
      status: 'À compléter',
      statusColor: 'warning' as const,
      subtitle: 'CIP 2026',
    },
    {
      title: 'Évaluation Mi-parcours',
      description: 'Revue intermédiaire de vos objectifs',
      icon: ClipboardCheck,
      href: '/dashboard/employee/appraisal-mid',
      status: 'Non démarré',
      statusColor: 'secondary' as const,
      subtitle: 'Juin 2026',
    },
    {
      title: 'Évaluation Fin d\'année',
      description: 'Bilan annuel de votre performance',
      icon: FileText,
      href: '/dashboard/employee/appraisal-end',
      status: 'Non démarré',
      statusColor: 'secondary' as const,
      subtitle: 'Décembre 2026',
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenue, {employee?.first_name} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre performance et atteignez vos objectifs
        </p>
      </div>

      {/* Info Banner */}
      <div className="ivela-gradient rounded-xl p-6 mb-8 text-primary-foreground animate-slide-up">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Cycle de Performance 2026</h2>
            <p className="text-primary-foreground/80 max-w-2xl">
              Commencez par définir vos objectifs dans le Contrat Individuel de Performance (CIP),
              puis complétez les évaluations mi-parcours et fin d'année.
            </p>
          </div>
          <Calendar className="h-12 w-12 text-accent hidden md:block" />
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              to={card.href}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="h-full card-hover animate-slide-up">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={card.statusColor}>{card.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{card.subtitle}</span>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">Objectifs définis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">-</div>
            <p className="text-sm text-muted-foreground">Score mi-parcours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">-</div>
            <p className="text-sm text-muted-foreground">Score fin d'année</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ivela-success">0</div>
            <p className="text-sm text-muted-foreground">Compétences en cours</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
