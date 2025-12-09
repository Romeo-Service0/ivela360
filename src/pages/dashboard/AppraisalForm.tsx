import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase, Goal, GoalSetting } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Printer, ArrowLeft, Calculator, Loader2 } from 'lucide-react';

interface AppraisalFormProps {
  type: 'mid-year' | 'end-year';
}

interface GoalEvaluation {
  goalId: string;
  description: string;
  weight: number;
  midYearProgress: number;
  midYearTrend: 'up' | 'down' | 'stable' | '';
  midYearComments: string;
  endYearScore: number;
  endYearComments: string;
}

interface BehaviorEvaluation {
  dimension: string;
  label: string;
  description: string;
  weight: number;
  midYearScore: number;
  endYearScore: number;
}

const AppraisalForm = ({ type }: AppraisalFormProps) => {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [goalSetting, setGoalSetting] = useState<GoalSetting | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [goalEvaluations, setGoalEvaluations] = useState<GoalEvaluation[]>([]);
  const [evaluators, setEvaluators] = useState(['', '', '']);
  const [behaviorEvaluations, setBehaviorEvaluations] = useState<BehaviorEvaluation[]>([
    { dimension: 'able', label: 'ABLE', description: 'Capable - Compétences, expertise', weight: 25, midYearScore: 0, endYearScore: 0 },
    { dimension: 'believable', label: 'BELIEVABLE', description: 'Crédible - Intégrité, éthique', weight: 25, midYearScore: 0, endYearScore: 0 },
    { dimension: 'connected', label: 'CONNECTED', description: 'Connecté - Collaboration, communication', weight: 25, midYearScore: 0, endYearScore: 0 },
    { dimension: 'dependable', label: 'DEPENDABLE', description: 'Fiable - Responsabilité, suivi', weight: 25, midYearScore: 0, endYearScore: 0 },
  ]);

  const [developmentTracking, setDevelopmentTracking] = useState([
    { competence: '', initial: '', target: '', actions: '', midAdvancement: '', midObservations: '', endAchieved: false, endComments: '' },
    { competence: '', initial: '', target: '', actions: '', midAdvancement: '', midObservations: '', endAchieved: false, endComments: '' },
    { competence: '', initial: '', target: '', actions: '', midAdvancement: '', midObservations: '', endAchieved: false, endComments: '' },
  ]);

  const [employeeAppreciation, setEmployeeAppreciation] = useState('');
  const [managerAppreciation, setManagerAppreciation] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [perspectives, setPerspectives] = useState('');

  // Calculate scores
  const objectivesScore = goalEvaluations.reduce((sum, goal) => {
    const score = type === 'mid-year' ? goal.midYearProgress : goal.endYearScore;
    return sum + (score * goal.weight / 100);
  }, 0);

  const behaviorScore = behaviorEvaluations.reduce((sum, behavior) => {
    const score = type === 'mid-year' ? behavior.midYearScore : behavior.endYearScore;
    return sum + (score * behavior.weight / 100);
  }, 0);

  const globalScore = (objectivesScore * 0.6) + (behaviorScore * 0.4);
  const globalPercentage = (globalScore / 5) * 100;

  useEffect(() => {
    const fetchData = async () => {
      if (!employee?.id) return;

      try {
        // Fetch goal setting
        const { data: gsData, error: gsError } = await supabase
          .from('goal_settings')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('cycle_year', 2026)
          .maybeSingle();

        if (gsError) throw gsError;
        setGoalSetting(gsData);

        if (gsData) {
          // Fetch goals
          const { data: goalsData, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('goal_setting_id', gsData.id);

          if (goalsError) throw goalsError;
          setGoals(goalsData || []);

          // Initialize goal evaluations
          setGoalEvaluations(
            (goalsData || []).map(goal => ({
              goalId: goal.id,
              description: goal.description,
              weight: goal.weight,
              midYearProgress: 0,
              midYearTrend: '',
              midYearComments: '',
              endYearScore: 0,
              endYearComments: '',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employee]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create appraisal record
      const { data: appraisal, error: appraisalError } = await supabase
        .from('appraisals')
        .insert({
          employee_id: employee?.id,
          goal_setting_id: goalSetting?.id,
          type,
          cycle_year: 2026,
          objectives_score: objectivesScore,
          behavior_score: behaviorScore,
          global_score: globalScore,
          employee_appreciation: employeeAppreciation,
          manager_appreciation: managerAppreciation,
          strengths,
          improvements,
          perspectives,
          status: 'submitted',
        })
        .select()
        .single();

      if (appraisalError) throw appraisalError;

      // Create appraisal goals
      const appraisalGoals = goalEvaluations.map(ge => ({
        appraisal_id: appraisal.id,
        goal_id: ge.goalId,
        mid_year_progress: ge.midYearProgress,
        mid_year_trend: ge.midYearTrend || null,
        mid_year_comments: ge.midYearComments,
        end_year_score: ge.endYearScore,
        end_year_comments: ge.endYearComments,
      }));

      const { error: agError } = await supabase
        .from('appraisal_goals')
        .insert(appraisalGoals);

      if (agError) throw agError;

      toast.success('Évaluation soumise avec succès');
      navigate('/dashboard/employee');
    } catch (err) {
      console.error('Error submitting appraisal:', err);
      toast.error('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const title = type === 'mid-year' ? 'Revue Mi-parcours' : 'Évaluation Fin d\'année';

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
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">Cycle 2026</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer (PDF)
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Envoi...' : 'Soumettre'}
            </Button>
          </div>
        </div>

        {/* Form Header */}
        <div className="ivela-gradient rounded-t-xl p-4 text-center">
          <h2 className="text-xl font-bold text-primary-foreground">
            IVELA 360° – Évaluation du Contrat Individuel de Performance
          </h2>
          <p className="text-primary-foreground/80 text-sm">
            {title} – Cycle 2026 | Référence: EVALRPDRH2025001.1.0
          </p>
        </div>

        {/* Employee Info */}
        <Card className="rounded-t-none border-t-0 mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">Informations du Collaborateur</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Collaborateur</Label>
                <p className="font-medium">{employee?.first_name} {employee?.last_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Matricule</Label>
                <p className="font-medium">{employee?.matricule}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Poste</Label>
                <p className="font-medium">{employee?.poste}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Service</Label>
                <p className="font-medium">{employee?.service}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Manager (N+1)</Label>
                <p className="font-medium">-</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Date revue</Label>
                <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Scale */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">Échelle d'évaluation (1 à 5)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="font-bold text-destructive">1</div>
                <div className="text-muted-foreground">Insuffisant</div>
                <div className="text-xs">Non atteint</div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <div className="font-bold text-orange-700">2</div>
                <div className="text-muted-foreground">Partiel</div>
                <div className="text-xs">Écarts constatés</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="font-bold text-yellow-700">3</div>
                <div className="text-muted-foreground">Conforme</div>
                <div className="text-xs">Atteint</div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <div className="font-bold text-emerald-700">4</div>
                <div className="text-muted-foreground">Supérieur</div>
                <div className="text-xs">Dépassé</div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="font-bold text-primary">5</div>
                <div className="text-muted-foreground">Exceptionnel</div>
                <div className="text-xs">Impact durable</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 1 - Évaluation des objectifs */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">BLOC 1 — Évaluation des Objectifs de Résultats</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {goalEvaluations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun objectif défini. Veuillez d'abord compléter le Contrat Individuel de Performance.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="form-table">
                  <thead>
                    <tr>
                      <th>Objectif</th>
                      <th className="text-center w-20">Pond. (%)</th>
                      {type === 'mid-year' ? (
                        <>
                          <th className="text-center w-24">Avancement (%)</th>
                          <th className="text-center w-20">Tendance</th>
                          <th className="w-48">Commentaires</th>
                        </>
                      ) : (
                        <>
                          <th className="text-center w-24">Score (1-5)</th>
                          <th className="w-48">Commentaires</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {goalEvaluations.map((goal, index) => (
                      <tr key={goal.goalId}>
                        <td className="text-sm">{goal.description}</td>
                        <td className="text-center font-medium">{goal.weight}%</td>
                        {type === 'mid-year' ? (
                          <>
                            <td>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={goal.midYearProgress || ''}
                                onChange={(e) => {
                                  const newEvals = [...goalEvaluations];
                                  newEvals[index].midYearProgress = parseInt(e.target.value) || 0;
                                  setGoalEvaluations(newEvals);
                                }}
                                className="text-center"
                              />
                            </td>
                            <td>
                              <Select
                                value={goal.midYearTrend}
                                onValueChange={(v) => {
                                  const newEvals = [...goalEvaluations];
                                  newEvals[index].midYearTrend = v as 'up' | 'down' | 'stable';
                                  setGoalEvaluations(newEvals);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="up">↑</SelectItem>
                                  <SelectItem value="stable">→</SelectItem>
                                  <SelectItem value="down">↓</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td>
                              <Input
                                value={goal.midYearComments}
                                onChange={(e) => {
                                  const newEvals = [...goalEvaluations];
                                  newEvals[index].midYearComments = e.target.value;
                                  setGoalEvaluations(newEvals);
                                }}
                                placeholder="Commentaires..."
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <Select
                                value={goal.endYearScore.toString()}
                                onValueChange={(v) => {
                                  const newEvals = [...goalEvaluations];
                                  newEvals[index].endYearScore = parseInt(v);
                                  setGoalEvaluations(newEvals);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td>
                              <Input
                                value={goal.endYearComments}
                                onChange={(e) => {
                                  const newEvals = [...goalEvaluations];
                                  newEvals[index].endYearComments = e.target.value;
                                  setGoalEvaluations(newEvals);
                                }}
                                placeholder="Commentaires..."
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50">
                      <td className="font-semibold text-right">TOTAL</td>
                      <td className="text-center font-bold">100%</td>
                      <td colSpan={type === 'mid-year' ? 3 : 2} className="text-right">
                        <span className="font-semibold">Score Objectifs: </span>
                        <span className="text-lg font-bold text-primary">{objectivesScore.toFixed(2)}/5</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BLOC 2 - Évaluation 360° des Comportements */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">BLOC 2 — Évaluation 360° des Comportements (ABCD de la Confiance)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              <Label className="font-semibold">Pairs évaluateurs</Label>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                {evaluators.map((evaluator, index) => (
                  <Input
                    key={index}
                    value={evaluator}
                    onChange={(e) => {
                      const newEvaluators = [...evaluators];
                      newEvaluators[index] = e.target.value;
                      setEvaluators(newEvaluators);
                    }}
                    placeholder={`Évaluateur ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="form-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th className="w-48">Attentes définies</th>
                    <th className="text-center w-20">Pond.</th>
                    {type === 'mid-year' ? (
                      <th className="text-center w-24">Mi-parcours</th>
                    ) : (
                      <th className="text-center w-24">Fin d'année</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {behaviorEvaluations.map((behavior, index) => (
                    <tr key={behavior.dimension}>
                      <td className="font-semibold text-primary">{behavior.label}</td>
                      <td className="text-sm text-muted-foreground">{behavior.description}</td>
                      <td className="text-center">{behavior.weight}%</td>
                      <td>
                        <Select
                          value={type === 'mid-year' ? behavior.midYearScore.toString() : behavior.endYearScore.toString()}
                          onValueChange={(v) => {
                            const newBehaviors = [...behaviorEvaluations];
                            if (type === 'mid-year') {
                              newBehaviors[index].midYearScore = parseInt(v);
                            } else {
                              newBehaviors[index].endYearScore = parseInt(v);
                            }
                            setBehaviorEvaluations(newBehaviors);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="/5" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}/5</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td colSpan={3} className="text-right font-semibold">
                      Score Comportements:
                    </td>
                    <td className="text-center">
                      <span className="text-lg font-bold text-primary">{behaviorScore.toFixed(2)}/5</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 3 - Suivi du Plan de Développement */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">BLOC 3 — Suivi du Plan de Développement Individuel</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="form-table">
                <thead>
                  <tr>
                    <th>Compétence</th>
                    <th>Initial</th>
                    <th>Cible</th>
                    <th>Actions prévues</th>
                    {type === 'mid-year' ? (
                      <>
                        <th>Avancement</th>
                        <th>Observations</th>
                      </>
                    ) : (
                      <>
                        <th className="text-center">Atteint</th>
                        <th>Commentaires</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {developmentTracking.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Input
                          value={item.competence}
                          onChange={(e) => {
                            const newTracking = [...developmentTracking];
                            newTracking[index].competence = e.target.value;
                            setDevelopmentTracking(newTracking);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.initial}
                          onChange={(e) => {
                            const newTracking = [...developmentTracking];
                            newTracking[index].initial = e.target.value;
                            setDevelopmentTracking(newTracking);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.target}
                          onChange={(e) => {
                            const newTracking = [...developmentTracking];
                            newTracking[index].target = e.target.value;
                            setDevelopmentTracking(newTracking);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.actions}
                          onChange={(e) => {
                            const newTracking = [...developmentTracking];
                            newTracking[index].actions = e.target.value;
                            setDevelopmentTracking(newTracking);
                          }}
                        />
                      </td>
                      {type === 'mid-year' ? (
                        <>
                          <td>
                            <Input
                              value={item.midAdvancement}
                              onChange={(e) => {
                                const newTracking = [...developmentTracking];
                                newTracking[index].midAdvancement = e.target.value;
                                setDevelopmentTracking(newTracking);
                              }}
                            />
                          </td>
                          <td>
                            <Input
                              value={item.midObservations}
                              onChange={(e) => {
                                const newTracking = [...developmentTracking];
                                newTracking[index].midObservations = e.target.value;
                                setDevelopmentTracking(newTracking);
                              }}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="text-center">
                            <Select
                              value={item.endAchieved ? 'yes' : 'no'}
                              onValueChange={(v) => {
                                const newTracking = [...developmentTracking];
                                newTracking[index].endAchieved = v === 'yes';
                                setDevelopmentTracking(newTracking);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Oui</SelectItem>
                                <SelectItem value="no">Non</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td>
                            <Input
                              value={item.endComments}
                              onChange={(e) => {
                                const newTracking = [...developmentTracking];
                                newTracking[index].endComments = e.target.value;
                                setDevelopmentTracking(newTracking);
                              }}
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 4 - Synthèse et Score Global */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              BLOC 4 — Synthèse et Score Global
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-4">Calcul du Score Global ({type === 'mid-year' ? 'Mi-parcours' : 'Fin d\'année'})</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Objectifs (60%):</span>
                    <span className="font-medium">{objectivesScore.toFixed(2)}/5 × 0.6 = <strong>{(objectivesScore * 0.6).toFixed(2)}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comportements (40%):</span>
                    <span className="font-medium">{behaviorScore.toFixed(2)}/5 × 0.4 = <strong>{(behaviorScore * 0.4).toFixed(2)}</strong></span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">SCORE GLOBAL:</span>
                    <span className="font-bold text-primary">{globalScore.toFixed(2)}/5 soit {globalPercentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-4">Interprétation du Score Global</h4>
                <div className="space-y-2 text-sm">
                  <p className={globalScore >= 4.6 ? 'font-bold text-primary' : ''}>
                    4.6 - 5: Exceptionnel – Leader / Modèle
                  </p>
                  <p className={globalScore >= 3.8 && globalScore < 4.6 ? 'font-bold text-emerald-600' : ''}>
                    3.8 - 4.5: Très solide – Performant & autonome
                  </p>
                  <p className={globalScore >= 3 && globalScore < 3.8 ? 'font-bold text-accent' : ''}>
                    3 - 3.7: Satisfaisant – Résultats conformes
                  </p>
                  <p className={globalScore >= 2 && globalScore < 3 ? 'font-bold text-orange-500' : ''}>
                    2 - 2.9: Insuffisant – Besoin de suivi
                  </p>
                  <p className={globalScore < 2 ? 'font-bold text-destructive' : ''}>
                    1 - 1.9: Critique – Performance à corriger
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 5 - Appréciations et Perspectives */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">BLOC 5 — Appréciations et Perspectives</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="font-semibold">Appréciation générale du Collaborateur</Label>
              <Textarea
                value={employeeAppreciation}
                onChange={(e) => setEmployeeAppreciation(e.target.value)}
                className="mt-2"
                placeholder="Votre appréciation générale..."
                rows={3}
              />
            </div>

            <div>
              <Label className="font-semibold">Appréciation générale du Manager (N+1)</Label>
              <Textarea
                value={managerAppreciation}
                onChange={(e) => setManagerAppreciation(e.target.value)}
                className="mt-2 bg-muted"
                placeholder="À compléter par le manager..."
                rows={3}
                disabled
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="font-semibold">Points forts identifiés</Label>
                <Textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="mt-2"
                  placeholder="Points forts..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="font-semibold">Axes d'amélioration prioritaires</Label>
                <Textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="mt-2"
                  placeholder="Axes d'amélioration..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="font-semibold">Perspectives d'évolution / Souhaits de mobilité</Label>
                <Textarea
                  value={perspectives}
                  onChange={(e) => setPerspectives(e.target.value)}
                  className="mt-2"
                  placeholder="Perspectives..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOC 6 - Validation et Signatures */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">BLOC 6 — Validation et Signatures</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <h4 className="font-semibold mb-4">{type === 'mid-year' ? 'Revue Mi-parcours' : 'Évaluation Fin d\'année'}</h4>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="font-medium mb-2 block">Collaborateur</Label>
                <div className="signature-box">
                  <span className="text-sm">Signature</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Date: ___/___/______</p>
              </div>
              <div>
                <Label className="font-medium mb-2 block">Superviseur (N+1)</Label>
                <div className="signature-box">
                  <span className="text-sm">Signature</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Date: ___/___/______</p>
              </div>
              <div>
                <Label className="font-medium mb-2 block">Manager (N+2)</Label>
                <div className="signature-box">
                  <span className="text-sm">Signature</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Date: ___/___/______</p>
              </div>
              <div>
                <Label className="font-medium mb-2 block">RH</Label>
                <div className="signature-box">
                  <span className="text-sm">Signature</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Date: ___/___/______</p>
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
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre l\'évaluation'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppraisalForm;
