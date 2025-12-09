import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase, Employee, ROLE_LABELS } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  ClipboardCheck,
  TrendingUp,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const ManagerDashboard = () => {
  const { employee } = useAuth();
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!employee?.id) return;

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('manager_id', employee.id);

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (err) {
        console.error('Error fetching team:', err);
        toast.error('Erreur lors du chargement de l\'équipe');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [employee]);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord Manager 📊
        </h1>
        <p className="text-muted-foreground mt-2">
          Suivez et évaluez la performance de votre équipe
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{teamMembers.length}</div>
                <p className="text-sm text-muted-foreground">Collaborateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-ivela-success/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-ivela-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ivela-success">0</div>
                <p className="text-sm text-muted-foreground">CIP Validés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">0</div>
                <p className="text-sm text-muted-foreground">Évaluations en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-ivela-info/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-ivela-info" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ivela-info">-</div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team List */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mon Équipe
          </CardTitle>
          <CardDescription>
            Liste des collaborateurs sous votre responsabilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun collaborateur dans votre équipe</p>
              <p className="text-sm mt-2">
                Les collaborateurs apparaîtront ici une fois assignés à votre équipe
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full ivela-gradient flex items-center justify-center text-primary-foreground font-semibold">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.poste} • {member.service} • {ROLE_LABELS[member.role]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">CIP en attente</Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
