import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudentProfileStats } from "../../../../hooks/useStudents";
import { useCoachNotes } from "../../../../hooks/useCoachNotes";
import { useToast } from "../../../../contexts/ToastContext";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import MeasurementForm from "../MeasurementForm";
import { useCreateStudentMeasurement } from "../../../../hooks/useMeasurements";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Dumbbell,
  Scale,
  Trophy,
  TrendingUp,
  Calendar,
  MessageSquare,
  Flame,
  Target,
  Ghost,
  Shield,
  Mail,
  MailX,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Clock,
  ChevronRight,
  BarChart3,
  Activity,
  StickyNote,
} from "lucide-react";

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { profileStats, isLoading, error, refetch } = useStudentProfileStats(id);
  const { notes, createNote, updateNote, deleteNote } = useCoachNotes(id);
  const {
    createStudentMeasurement,
    isLoading: isCreatingMeasurement,
  } = useCreateStudentMeasurement(id);

  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;
    const result = await createNote(newNote.trim());
    if (result) {
      setNewNote("");
      setIsAddingNote(false);
      showToast("Note ajoutée avec succès", "success");
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;
    const result = await updateNote(noteId, editingContent.trim());
    if (result) {
      setEditingNoteId(null);
      setEditingContent("");
      showToast("Note mise à jour", "success");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const success = await deleteNote(noteId);
    if (success) {
      showToast("Note supprimée", "success");
    }
  };

  const handleCreateMeasurement = async (formData: any) => {
    try {
      await createStudentMeasurement(formData);
      showToast("Mensuration ajoutée pour cet élève", "success");
      setShowMeasurementModal(false);
      await refetch();
    } catch (err) {
      console.error("Error creating student measurement:", err);
      showToast(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la mensuration",
        "error"
      );
    }
  };

  const getGoalLabel = (goal: string | null) => {
    const goals: Record<string, string> = {
      weight_loss: "Perte de poids",
      weight_gain: "Prise de poids",
      muscle_gain: "Prise de muscle",
      maintenance: "Maintien",
    };
    return goal ? goals[goal] || goal : "Non défini";
  };

  const getGoalColor = (goal: string | null) => {
    const colors: Record<string, string> = {
      weight_loss: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      weight_gain: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      muscle_gain: "bg-primary/10 text-primary border-primary/20",
      maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
    return goal ? colors[goal] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileStats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Profil introuvable"}</p>
          <Button variant="outline" onClick={() => navigate("/dashboard/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux élèves
          </Button>
        </div>
      </div>
    );
  }

  const { student, stats, recentSessions } = profileStats;

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/dashboard/students")}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux élèves
      </Button>

      {/* Header - Student Info */}
      <Card className="border-border/50 bg-card overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className={`text-xl ${student.isVirtual ? "bg-gradient-to-br from-violet-400 to-fuchsia-500" : "bg-gradient-to-br from-primary to-violet-500"} text-white font-bold`}>
                  {student.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${student.isVirtual ? "bg-violet-500/10 text-violet-600 border-violet-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                    {student.isVirtual ? <Ghost className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {student.isVirtual ? "Fiche client" : "Actif"}
                  </div>
                </div>
                <p className="text-muted-foreground">{student.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getGoalColor(student.goalType)}`}>
                    <Target className="h-3 w-3" />
                    {getGoalLabel(student.goalType)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {student.allowEmails ? (
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <MailX className="h-3.5 w-3.5" />
                    )}
                    {student.allowEmails ? "Emails activés" : "Emails désactivés"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Depuis le {new Date(student.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() =>
                  navigate(`/dashboard/training/new?studentId=${student.id}`)
                }
              >
                <Dumbbell className="h-4 w-4" />
                Créer une séance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setShowMeasurementModal(true)}
              >
                <Scale className="h-4 w-4" />
                Ajouter une mensuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Séances totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{(stats.totalVolume / 1000).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Volume total (T)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Flame className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Série en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <MessageSquare className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.sessionsWithComments}</p>
                <p className="text-sm text-muted-foreground">Séances commentées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Exercises */}
      {stats.topExercises.length > 0 && (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Top Exercices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topExercises.map((exercise, index) => (
                <div
                  key={exercise.name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                    index === 0
                      ? "bg-gradient-to-br from-amber-400 to-amber-600"
                      : index === 1
                      ? "bg-gradient-to-br from-slate-300 to-slate-500"
                      : "bg-gradient-to-br from-orange-400 to-orange-600"
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">{exercise.count} fois</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Evolution */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Scale className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Évolution du poids</h2>
            </div>
            {stats.weightEvolution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.weightEvolution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                    labelFormatter={(label: string) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
                    }}
                    formatter={(value: number) => [`${value} kg`, "Poids"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                <div className="text-center">
                  <Scale className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucune donnée de poids</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Frequency */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Fréquence hebdomadaire</h2>
            </div>
            {stats.weeklyFrequency.some((w: { week: string; count: number }) => w.count > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.weeklyFrequency}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                    formatter={(value: number) => [`${value} séance${value > 1 ? "s" : ""}`, "Fréquence"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucune séance enregistrée</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coach Notes */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <StickyNote className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Notes privées</h2>
                <p className="text-sm text-muted-foreground">{notes.length} note{notes.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            {!isAddingNote && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-2"
                onClick={() => setIsAddingNote(true)}
              >
                <Plus className="h-4 w-4" />
                Ajouter une note
              </Button>
            )}
          </div>

          {/* Add Note Form */}
          {isAddingNote && (
            <div className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Écrire une note sur la progression de cet élève..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-3 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg gap-2 bg-gradient-to-r from-primary to-violet-500"
                  onClick={handleCreateNote}
                  disabled={!newNote.trim()}
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {notes.length === 0 && !isAddingNote ? (
            <div className="text-center py-8">
              <StickyNote className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Aucune note pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">Ajoutez des notes pour suivre la progression</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-muted/50 border border-border group"
                >
                  {editingNoteId === note.id ? (
                    <div>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-3 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingContent("");
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-lg gap-2"
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={!editingContent.trim()}
                        >
                          <Save className="h-4 w-4" />
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingContent(note.content);
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMeasurementModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Scale className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Ajouter une mensuration
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Pour {profileStats.student.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMeasurementModal(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <MeasurementForm
                  measurement={null}
                  onSubmit={handleCreateMeasurement}
                  onCancel={() => setShowMeasurementModal(false)}
                  isLoading={isCreatingMeasurement}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Dernières séances</h2>
              <p className="text-sm text-muted-foreground">{recentSessions.length} dernière{recentSessions.length > 1 ? "s" : ""} séance{recentSessions.length > 1 ? "s" : ""}</p>
            </div>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Aucune séance enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(session.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {session.durationMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.durationMinutes} min
                            </span>
                          )}
                          <span>{session.exerciseCount} exercice{session.exerciseCount > 1 ? "s" : ""}</span>
                          <span>{(session.totalVolume / 1000).toFixed(1)}T volume</span>
                        </div>
                      </div>
                    </div>
                    {session.coachComment && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 border border-violet-500/20">
                        <MessageSquare className="h-3 w-3" />
                        Commenté
                      </div>
                    )}
                  </div>

                  {/* Exercises list */}
                  <div className="flex flex-wrap gap-2">
                    {session.exercises.map((ex, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs bg-background border border-border text-foreground"
                      >
                        {ex.name}
                        {ex.weightKg ? ` • ${ex.weightKg}kg` : ""}
                        {ex.repsUniform ? ` • ${ex.sets}x${ex.repsUniform}` : ` • ${ex.sets} séries`}
                      </span>
                    ))}
                  </div>

                  {/* Coach comment */}
                  {session.coachComment && (
                    <div className="mt-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                      <p className="text-xs font-medium text-violet-600 mb-1">Votre commentaire</p>
                      <p className="text-sm text-foreground">{session.coachComment}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <div className="mt-2 text-sm text-muted-foreground italic">
                      {session.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
