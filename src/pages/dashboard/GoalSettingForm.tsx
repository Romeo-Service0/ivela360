import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Printer, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface GoalEntry {
  id: number;
  description: string;
  specific: boolean;
  traceable: boolean;
  weight: number;
  developmentLevel: 'D1' | 'D2' | 'D3' | 'D4' | '';
  leadershipStyle: 'S1' | 'S2' | 'S3' | 'S4' | '';
}

interface DevelopmentPlan {
  competence: string;
  currentLevel: string;
  targetLevel: string;
  actions: string;
  deadline: string;
}

const GoalSettingForm = () => {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [meetingDate, setMeetingDate] = useState('');
  const [servicePriorities, setServicePriorities] = useState(['', '', '']);
  const [goals, setGoals] = useState<GoalEntry[]>([
    { id: 1, description: '', specific: false, traceable: false, weight: 0, developmentLevel: '', leadershipStyle: '' },
    { id: 2, description: '', specific: false, traceable: false, weight: 0, developmentLevel: '', leadershipStyle: '' },
    { id: 3, description: '', specific: false, traceable: false, weight: 0, developmentLevel: '', leadershipStyle: '' },
  ]);
  const [behaviorExpectations, setBehaviorExpectations] = useState({
    able: '',
    believable: '',
    connected: '',
    dependable: '',
    evaluators: ['', '', ''],
  });
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan[]>([
    { competence: '', currentLevel: '', targetLevel: '', actions: '', deadline: '' },
    { competence: '', currentLevel: '', targetLevel: '', actions: '', deadline: '' },
    { competence: '', currentLevel: '', targetLevel: '', actions: '', deadline: '' },
  ]);
  const [benefits, setBenefits] = useState(['', '', '']);
  const [managerDirective, setManagerDirective] = useState('');
  const [managerSupportive, setManagerSupportive] = useState('');

  const totalWeight = goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);

  const addGoal = () => {
    if (goals.length < 5) {
      setGoals([...goals, {
        id: goals.length + 1,
        description: '',
        specific: false,
        traceable: false,
        weight: 0,
        developmentLevel: '',
        leadershipStyle: '',
      }]);
    }
  };

  const removeGoal = (id: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const updateGoal = (id: number, field: keyof GoalEntry, value: string | boolean | number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleSubmit = async () => {
    if (totalWeight !== 100) {
      toast.error('La pondération totale doit être égale à 100%');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create goal_setting record
      const { data: goalSetting, error: gsError } = await supabase
        .from('goal_settings')
        .insert({
          employee_id: employee?.id,
          cycle_year: 2026,
          service_priorities: servicePriorities.filter(p => p.trim()),
          meeting_date: meetingDate,
          status: 'submitted',
        })
        .select()
        .single();

      if (gsError) throw gsError;

      // Create goals
      const goalsToInsert = goals
        .filter(g => g.description.trim())
        .map(g => ({
          goal_setting_id: goalSetting.id,
          description: g.description,
          specific: g.specific,
          traceable: g.traceable,
          weight: g.weight,
          development_level: g.developmentLevel,
          leadership_style: g.leadershipStyle,
        }));

      if (goalsToInsert.length > 0) {
        const { error: goalsError } = await supabase
          .from('goals')
          .insert(goalsToInsert);

        if (goalsError) throw goalsError;
      }

      toast.success('Contrat de Performance soumis avec succès');
      navigate('/dashboard/employee');
    } catch (err) {
      console.error('Error submitting goal setting:', err);
      toast.error('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/employee')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Contrat Individuel de Performance
              </h1>
              <p className="text-muted-foreground">Cycle 2026</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Envoi...' : 'Soumettre'}
            </Button>
          </div>
        </div>

        {/* Form Header */}
        <div className="ivela-gradient rounded-t-xl p-4 text-center print:bg-sidebar">
          <h2 className="text-xl font-bold text-primary-foreground">
            IVELA 360° – CONTRAT INDIVIDUEL DE PERFORMANCE
          </h2>
          <p className="text-primary-foreground/80 text-sm">Référence: CIPRPDRH2026001</p>
        </div>

        {/* BLOC 1 - Informations générales */}
        <Card className="rounded-t-none border-t-0 mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">1. Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Collaborateur</Label>
                <Input
                  value={`${employee?.first_name} ${employee?.last_name}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Matricule</Label>
                <Input value={employee?.matricule || ''} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Poste</Label>
                <Input value={employee?.poste || ''} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Service / Division</Label>
                <Input
                  value={`${employee?.service} / ${employee?.division}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Manager (N+1)</Label>
                <Input placeholder="Nom du manager" disabled className="bg-muted" />
              </div>
              <div>
                <Label>Date entretien</Label>
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 2 - Priorités du Service */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">
              2. Priorités / Objectifs du Service & de la Division
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (3 maximum – complétés par le N+1)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {servicePriorities.map((priority, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <Input
                    value={priority}
                    onChange={(e) => {
                      const newPriorities = [...servicePriorities];
                      newPriorities[index] = e.target.value;
                      setServicePriorities(newPriorities);
                    }}
                    placeholder={`Priorité ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BLOC 3 - Objectifs individuels */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">
              3. Objectifs individuels & Diagnostic de développement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Legend */}
            <div className="mb-4 p-4 bg-secondary rounded-lg text-sm">
              <p className="font-medium mb-2">Structure d'un objectif Spécifique & Traçable</p>
              <p><strong>S</strong> – Quoi exactement et quand ? (action + résultat qualitatif ou quantitatif attendu + délai)</p>
              <p><strong>T</strong> – Comment sera-t-il mesuré/suivi ? (indicateur + valeur cible)</p>
              <p className="mt-2 text-muted-foreground italic">
                Ex: "Réduire le taux de rebut de 5% à 3% d'ici le 30 juin 2026, mesuré par le rapport qualité mensuel"
              </p>
            </div>

            {/* Goals Table */}
            <div className="overflow-x-auto">
              <table className="form-table">
                <thead>
                  <tr>
                    <th className="w-1/2">Objectif (Quoi + Quand + Comment mesurer)</th>
                    <th className="text-center w-12">S</th>
                    <th className="text-center w-12">T</th>
                    <th className="text-center w-20">Pond. %</th>
                    <th className="text-center w-20">Niveau</th>
                    <th className="text-center w-20">Style</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal, index) => (
                    <tr key={goal.id}>
                      <td>
                        <Textarea
                          value={goal.description}
                          onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                          placeholder={`Objectif ${index + 1}`}
                          className="min-h-[80px]"
                        />
                      </td>
                      <td className="text-center">
                        <Checkbox
                          checked={goal.specific}
                          onCheckedChange={(checked) => updateGoal(goal.id, 'specific', checked === true)}
                        />
                      </td>
                      <td className="text-center">
                        <Checkbox
                          checked={goal.traceable}
                          onCheckedChange={(checked) => updateGoal(goal.id, 'traceable', checked === true)}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={goal.weight || ''}
                          onChange={(e) => updateGoal(goal.id, 'weight', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td>
                        <Select
                          value={goal.developmentLevel}
                          onValueChange={(v) => updateGoal(goal.id, 'developmentLevel', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D1">D1</SelectItem>
                            <SelectItem value="D2">D2</SelectItem>
                            <SelectItem value="D3">D3</SelectItem>
                            <SelectItem value="D4">D4</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <Select
                          value={goal.leadershipStyle}
                          onValueChange={(v) => updateGoal(goal.id, 'leadershipStyle', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S1">S1</SelectItem>
                            <SelectItem value="S2">S2</SelectItem>
                            <SelectItem value="S3">S3</SelectItem>
                            <SelectItem value="S4">S4</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={goals.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="text-right font-semibold">
                      TOTAL PONDÉRATION →
                    </td>
                    <td></td>
                    <td className={`text-center font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-destructive'}`}>
                      {totalWeight}%
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {goals.length < 5 && (
              <Button variant="outline" onClick={addGoal} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un objectif
              </Button>
            )}

            {/* Development/Style Legend */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-2">Correspondance Niveau de développement / Style de leadership</p>
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>D1 → S1</strong> (Débutant engagé → Orienter) Cadre très structuré, indications précises</p>
                <p><strong>D2 → S2</strong> (Bloqué ou En difficulté → Coacher) Cadre structuré, accompagnement renforcé</p>
                <p><strong>D3 → S3</strong> (Trop prudent → Épauler) Autonomie encadrée, soutien actif</p>
                <p><strong>D4 → S4</strong> (Expert autonome → Déléguer) Grande autonomie, supervision légère</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 4 - Attentes comportementales 360° */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">
              4. Attentes comportementales 360° (ABCD de la Confiance)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Comportements attendus selon l'ABCD de la confiance (À collecter auprès des pairs évaluateurs désignés)
            </p>

            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-primary">
                  A - Able (Capable)
                  <span className="font-normal text-muted-foreground ml-2">
                    Compétences, expertise, résultats attendus
                  </span>
                </Label>
                <Textarea
                  value={behaviorExpectations.able}
                  onChange={(e) => setBehaviorExpectations({...behaviorExpectations, able: e.target.value})}
                  className="mt-2"
                  placeholder="Décrivez les comportements attendus..."
                />
              </div>

              <div>
                <Label className="font-semibold text-primary">
                  B - Believable (Crédible)
                  <span className="font-normal text-muted-foreground ml-2">
                    Intégrité, honnêteté, éthique
                  </span>
                </Label>
                <Textarea
                  value={behaviorExpectations.believable}
                  onChange={(e) => setBehaviorExpectations({...behaviorExpectations, believable: e.target.value})}
                  className="mt-2"
                  placeholder="Décrivez les comportements attendus..."
                />
              </div>

              <div>
                <Label className="font-semibold text-primary">
                  C - Connected (Connecté)
                  <span className="font-normal text-muted-foreground ml-2">
                    Collaboration, communication, empathie
                  </span>
                </Label>
                <Textarea
                  value={behaviorExpectations.connected}
                  onChange={(e) => setBehaviorExpectations({...behaviorExpectations, connected: e.target.value})}
                  className="mt-2"
                  placeholder="Décrivez les comportements attendus..."
                />
              </div>

              <div>
                <Label className="font-semibold text-primary">
                  D - Dependable (Fiable)
                  <span className="font-normal text-muted-foreground ml-2">
                    Fiabilité, responsabilité, suivi des engagements
                  </span>
                </Label>
                <Textarea
                  value={behaviorExpectations.dependable}
                  onChange={(e) => setBehaviorExpectations({...behaviorExpectations, dependable: e.target.value})}
                  className="mt-2"
                  placeholder="Décrivez les comportements attendus..."
                />
              </div>

              <div>
                <Label className="font-semibold">Pairs évaluateurs désignés</Label>
                <div className="grid md:grid-cols-3 gap-4 mt-2">
                  {behaviorExpectations.evaluators.map((evaluator, index) => (
                    <Input
                      key={index}
                      value={evaluator}
                      onChange={(e) => {
                        const newEvaluators = [...behaviorExpectations.evaluators];
                        newEvaluators[index] = e.target.value;
                        setBehaviorExpectations({...behaviorExpectations, evaluators: newEvaluators});
                      }}
                      placeholder={`Évaluateur ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 5 - Plan de développement individuel */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">5. Plan de développement individuel</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Compétences à développer (techniques ou transverses)
            </p>

            <div className="overflow-x-auto">
              <table className="form-table">
                <thead>
                  <tr>
                    <th>Compétence</th>
                    <th>Niveau actuel</th>
                    <th>Niveau cible</th>
                    <th>Actions prévues</th>
                    <th>Échéance</th>
                  </tr>
                </thead>
                <tbody>
                  {developmentPlan.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Input
                          value={item.competence}
                          onChange={(e) => {
                            const newPlan = [...developmentPlan];
                            newPlan[index].competence = e.target.value;
                            setDevelopmentPlan(newPlan);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.currentLevel}
                          onChange={(e) => {
                            const newPlan = [...developmentPlan];
                            newPlan[index].currentLevel = e.target.value;
                            setDevelopmentPlan(newPlan);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.targetLevel}
                          onChange={(e) => {
                            const newPlan = [...developmentPlan];
                            newPlan[index].targetLevel = e.target.value;
                            setDevelopmentPlan(newPlan);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.actions}
                          onChange={(e) => {
                            const newPlan = [...developmentPlan];
                            newPlan[index].actions = e.target.value;
                            setDevelopmentPlan(newPlan);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          type="date"
                          value={item.deadline}
                          onChange={(e) => {
                            const newPlan = [...developmentPlan];
                            newPlan[index].deadline = e.target.value;
                            setDevelopmentPlan(newPlan);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Benefits */}
            <div className="mt-6">
              <Label className="font-semibold">Ce que j'y gagne (résultats / compétences)</Label>
              <p className="text-sm text-muted-foreground mb-2">Focus sur les bénéfices individuels</p>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-primary">•</span>
                    <Input
                      value={benefit}
                      onChange={(e) => {
                        const newBenefits = [...benefits];
                        newBenefits[index] = e.target.value;
                        setBenefits(newBenefits);
                      }}
                      placeholder={`Bénéfice ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 6 - Plan d'accompagnement du Manager */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">6. Plan d'accompagnement du Manager</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold">Comportements Directifs (S1/S2)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Fixer les objectifs, montrer/expliquer comment faire, établir les priorités, clarifier les rôles
                </p>
                <Textarea
                  value={managerDirective}
                  onChange={(e) => setManagerDirective(e.target.value)}
                  placeholder="Décrivez les comportements directifs..."
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label className="font-semibold">Comportements Supportifs (S2/S3/S4)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Écouter, encourager, faciliter, valoriser, impliquer dans les décisions
                </p>
                <Textarea
                  value={managerSupportive}
                  onChange={(e) => setManagerSupportive(e.target.value)}
                  placeholder="Décrivez les comportements supportifs..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 7 - Signatures */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">7. Engagement & Signatures</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold mb-2 block">Collaborateur</Label>
                <div className="signature-box">
                  <span className="text-sm">Signature du collaborateur</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Date: ___/___/______
                </p>
              </div>
              <div>
                <Label className="font-semibold mb-2 block">Manager (N+1)</Label>
                <div className="signature-box">
                  <span className="text-sm">Signature du manager</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Date: ___/___/______
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 no-print">
          <Button variant="outline" onClick={() => navigate('/dashboard/employee')}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre le CIP'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GoalSettingForm;
