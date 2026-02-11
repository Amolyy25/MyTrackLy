import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import API_URL from "../../../../config/api";
import { useToast } from "../../../../contexts/ToastContext";
import { useCreateVirtualStudent } from "../../../../hooks/useStudents";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Search,
  Dumbbell,
  Scale,
  Calendar,
  ChevronRight,
  Target,
  MoreVertical,
  Ticket,
  Sparkles,
  UserCheck,
  AlertCircle,
  RefreshCw,
  X,
  Mail,
  MailX,
  Ghost,
  Shield,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  goalType: string | null;
  isVirtual: boolean;
  allowEmails: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    trainingSessions: number;
    measurements: number;
  };
}

interface InvitationCode {
  id: string;
  code: string;
  used: boolean;
  createdAt: string;
  usedAt: string | null;
  usedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const Students: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { createVirtualStudent, isLoading: isCreatingClient } = useCreateVirtualStudent();
  const [students, setStudents] = useState<Student[]>([]);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [creatingCode, setCreatingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGoal, setFilterGoal] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all"); // "all" | "active" | "virtual"

  // Formulaire de création client
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    goalType: "",
    allowEmails: true,
  });

  useEffect(() => {
    fetchStudents();
    fetchInvitationCodes();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des élèves");
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitationCodes = async () => {
    try {
      const response = await fetch(`${API_URL}/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des codes");
      const data = await response.json();
      setInvitationCodes(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des codes:", err);
    }
  };

  const createInvitationCode = async () => {
    setCreatingCode(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/invitations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la création du code");
      }
      const newCode = await response.json();
      setInvitationCodes([newCode, ...invitationCodes]);
      showToast("Code d'invitation généré avec succès !", "success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setCreatingCode(false);
    }
  };

  const handleCreateClient = async () => {
    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      showToast("Le nom et l'email sont obligatoires.", "error");
      return;
    }

    const result = await createVirtualStudent({
      name: clientForm.name,
      email: clientForm.email,
      goalType: clientForm.goalType,
      allowEmails: clientForm.allowEmails,
    });

    if (result) {
      setStudents([result as Student, ...students]);
      setClientForm({ name: "", email: "", goalType: "", allowEmails: true });
      setShowCreateClientModal(false);
      showToast("Fiche client créée avec succès !", "success");
    } else {
      showToast("Erreur lors de la création de la fiche client.", "error");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast("Code copié dans le presse-papiers !", "success");
    setTimeout(() => setCopiedCode(null), 2000);
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

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGoal = filterGoal === "all" || student.goalType === filterGoal;
      const matchesType =
        filterType === "all" ||
        (filterType === "active" && !student.isVirtual) ||
        (filterType === "virtual" && student.isVirtual);
      return matchesSearch && matchesGoal && matchesType;
    });
  }, [students, searchQuery, filterGoal, filterType]);

  const availableCodes = invitationCodes.filter((c) => !c.used);
  const totalSessions = students.reduce((sum, s) => sum + s._count.trainingSessions, 0);
  const totalMeasurements = students.reduce((sum, s) => sum + s._count.measurements, 0);
  const virtualCount = students.filter((s) => s.isVirtual).length;
  const activeCount = students.filter((s) => !s.isVirtual).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des élèves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/25">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mes Élèves</h1>
            <p className="text-muted-foreground text-sm">
              {activeCount} actif{activeCount > 1 ? "s" : ""} • {virtualCount} fiche{virtualCount > 1 ? "s" : ""} client • {availableCodes.length} invitation{availableCodes.length > 1 ? "s" : ""} disponible{availableCodes.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-11 gap-2"
            onClick={() => setShowCreateClientModal(true)}
          >
            <Ghost className="h-4 w-4" />
            Ajouter un client
          </Button>
          <Button
            className="rounded-xl h-11 gap-2 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg shadow-primary/25"
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus className="h-4 w-4" />
            Inviter un élève
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Élèves actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <Ghost className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{virtualCount}</p>
                <p className="text-sm text-muted-foreground">Fiches clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Dumbbell className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalSessions}</p>
                <p className="text-sm text-muted-foreground">Séances totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Scale className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalMeasurements}</p>
                <p className="text-sm text-muted-foreground">Mensurations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <Ticket className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{availableCodes.length}</p>
                <p className="text-sm text-muted-foreground">Codes disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all min-w-[140px]"
              >
                <option value="all">Tous les types</option>
                <option value="active">Élèves actifs</option>
                <option value="virtual">Fiches clients</option>
              </select>
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all min-w-[160px]"
              >
                <option value="all">Tous les objectifs</option>
                <option value="weight_loss">Perte de poids</option>
                <option value="weight_gain">Prise de poids</option>
                <option value="muscle_gain">Prise de muscle</option>
                <option value="maintenance">Maintien</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-12 text-center">
            {students.length === 0 ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Aucun élève pour le moment</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Invitez vos premiers élèves avec un code d'invitation ou créez une fiche client manuellement.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    className="rounded-xl h-11 gap-2"
                    onClick={() => setShowCreateClientModal(true)}
                  >
                    <Ghost className="h-4 w-4" />
                    Créer une fiche client
                  </Button>
                  <Button
                    className="rounded-xl h-11 gap-2 bg-gradient-to-r from-primary to-violet-500"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Créer un code d'invitation
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Aucun résultat</h3>
                <p className="text-muted-foreground">
                  Aucun élève ne correspond à votre recherche.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => (
            <Card
              key={student.id}
              className="border-border/50 bg-card hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/dashboard/coach/student/${student.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className={`${student.isVirtual ? "bg-gradient-to-br from-violet-400 to-fuchsia-500" : "bg-gradient-to-br from-primary to-violet-500"} text-white font-bold`}>
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {student.name}
                        </h3>
                        {student.isVirtual && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-violet-500/10 text-violet-600 border border-violet-500/20">
                            Fiche
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!student.allowEmails && (
                      <div className="p-1.5 rounded-lg" title="Emails désactivés">
                        <MailX className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getGoalColor(student.goalType)}`}>
                    <Target className="h-3 w-3" />
                    {getGoalLabel(student.goalType)}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${student.isVirtual ? "bg-violet-500/10 text-violet-600 border-violet-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                    {student.isVirtual ? <Ghost className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {student.isVirtual ? "Fiche client" : "Actif"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Séances</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{student._count.trainingSessions}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Mesures</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{student._count.measurements}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {student.isVirtual ? "Créé" : "Inscrit"} le {new Date(student.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invitation Codes Section */}
      {invitationCodes.length > 0 && (
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Ticket className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Codes d'invitation</h2>
                  <p className="text-sm text-muted-foreground">{availableCodes.length} disponible{availableCodes.length > 1 ? "s" : ""} sur {invitationCodes.length}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-2"
                onClick={createInvitationCode}
                disabled={creatingCode}
              >
                {creatingCode ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Nouveau code
              </Button>
            </div>
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {invitationCodes.map((code) => (
                <div
                  key={code.id}
                  className={`p-4 flex items-center justify-between ${code.used ? "bg-muted/30" : "hover:bg-muted/50"} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${code.used ? "bg-muted" : "bg-emerald-500/10"}`}>
                      {code.used ? (
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Ticket className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold text-foreground">{code.code}</code>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${code.used ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-600"}`}>
                          {code.used ? "Utilisé" : "Disponible"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {code.used && code.usedBy ? (
                          <>Utilisé par {code.usedBy.name}</>
                        ) : (
                          <>Créé le {new Date(code.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  {!code.used && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-2"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copiedCode === code.code ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copier
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Client Modal */}
      {showCreateClientModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateClientModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500">
                      <Ghost className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Ajouter un client</h2>
                      <p className="text-sm text-muted-foreground">Créer une fiche client sans compte</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateClientModal(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Prénom et Nom <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all"
                    />
                  </div>

                  {/* Objectif */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Objectif
                    </label>
                    <select
                      value={clientForm.goalType}
                      onChange={(e) => setClientForm({ ...clientForm, goalType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all"
                    >
                      <option value="">Sélectionner un objectif</option>
                      <option value="weight_loss">Perte de poids</option>
                      <option value="weight_gain">Prise de poids</option>
                      <option value="muscle_gain">Prise de muscle</option>
                      <option value="maintenance">Maintien</option>
                    </select>
                  </div>

                  {/* Toggle emails */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      {clientForm.allowEmails ? (
                        <Mail className="h-5 w-5 text-primary" />
                      ) : (
                        <MailX className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">Autoriser l'envoi d'emails</p>
                        <p className="text-xs text-muted-foreground">Rapports de séance, notifications</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClientForm({ ...clientForm, allowEmails: !clientForm.allowEmails })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${clientForm.allowEmails ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${clientForm.allowEmails ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  {/* Info box */}
                  <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0 mt-0.5">
                        <Ghost className="h-4 w-4 text-violet-500" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Fiche client</p>
                        <p>Ce client n'aura pas accès à l'application. Vous pourrez gérer ses séances, mensurations et notes depuis votre tableau de bord.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-11"
                    onClick={() => setShowCreateClientModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    onClick={handleCreateClient}
                    disabled={isCreatingClient || !clientForm.name.trim() || !clientForm.email.trim()}
                  >
                    {isCreatingClient ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Ghost className="h-4 w-4" />
                        Créer la fiche
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Inviter un élève</h2>
                    <p className="text-sm text-muted-foreground">Générez un code d'invitation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Comment ça marche ?</p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Générez un code d'invitation unique</li>
                      <li>Partagez-le avec votre élève</li>
                      <li>Il s'inscrit avec ce code</li>
                      <li>Il apparaît automatiquement ici</li>
                    </ol>
                  </div>
                </div>
              </div>

              {availableCodes.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">Codes disponibles :</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {availableCodes.map((code) => (
                      <div key={code.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <code className="font-mono font-bold text-foreground">{code.code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          {copiedCode === code.code ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copier
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => setShowInviteModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 rounded-xl h-11 gap-2 bg-gradient-to-r from-primary to-violet-500"
                  onClick={createInvitationCode}
                  disabled={creatingCode}
                >
                  {creatingCode ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Générer un code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center gap-3 px-4 py-3 bg-destructive text-destructive-foreground rounded-xl shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="p-1 rounded hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
