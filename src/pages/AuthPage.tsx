import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth, hasManagementAccess } from '@/lib/auth';
import { EmployeeRole, ROLE_LABELS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, Mail, Lock, Building, Briefcase, Users } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, employee, loading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [poste, setPoste] = useState('');
  const [service, setService] = useState('');
  const [division, setDivision] = useState('');
  const [role, setRole] = useState<EmployeeRole>('collaborateur');

  // Redirect if already logged in
  if (user && employee && !loading) {
    const redirectPath = hasManagementAccess(employee.role)
      ? '/dashboard/manager'
      : '/dashboard/employee';
    return <Navigate to={redirectPath} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);

      if (error) {
        toast.error('Échec de la connexion', {
          description: error.message || 'Email ou mot de passe incorrect',
        });
      } else {
        toast.success('Connexion réussie');
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(registerEmail, registerPassword, {
        first_name: firstName,
        last_name: lastName,
        matricule,
        poste,
        service,
        division,
        role,
      });

      if (error) {
        toast.error('Échec de l\'inscription', {
          description: error.message,
        });
      } else {
        toast.success('Inscription réussie', {
          description: 'Vérifiez votre email pour confirmer votre compte',
        });
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ivela-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ivela-gradient-light flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          IVELA <span className="text-primary">360°</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Système de Gestion de la Performance
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md shadow-ivela-lg animate-slide-up">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Min. 6 caractères"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule</Label>
                    <Input
                      id="matricule"
                      placeholder="MAT001"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poste">Poste</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="poste"
                        placeholder="Analyste"
                        value={poste}
                        onChange={(e) => setPoste(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="service"
                        placeholder="RH"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Input
                      id="division"
                      placeholder="Siège"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Rôle
                  </Label>
                  <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">
                        <div className="flex flex-col">
                          <span className="font-medium">{ROLE_LABELS.manager}</span>
                          <span className="text-xs text-muted-foreground">Direction et pilotage stratégique</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="superviseur">
                        <div className="flex flex-col">
                          <span className="font-medium">{ROLE_LABELS.superviseur}</span>
                          <span className="text-xs text-muted-foreground">Encadrement direct des équipes</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rh">
                        <div className="flex flex-col">
                          <span className="font-medium">{ROLE_LABELS.rh}</span>
                          <span className="text-xs text-muted-foreground">Gestion des ressources humaines</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="collaborateur">
                        <div className="flex flex-col">
                          <span className="font-medium">{ROLE_LABELS.collaborateur}</span>
                          <span className="text-xs text-muted-foreground">Membre de l'équipe</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pair">
                        <div className="flex flex-col">
                          <span className="font-medium">{ROLE_LABELS.pair}</span>
                          <span className="text-xs text-muted-foreground">Collègue de même niveau hiérarchique</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    'S\'inscrire'
                  )}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        © 2026 IVELA 360° - Tous droits réservés
      </p>
    </div>
  );
};

export default AuthPage;
