import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import API_URL from "../../../config/api";
import { AuthLayout, labelClass, inputClass, errorTextClass, submitClass } from "./AuthLayout";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  goalType: "weight_loss" | "weight_gain" | "maintenance" | "muscle_gain" | "";
  coachCode?: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  goalType?: string;
  coachCode?: string;
  general?: string;
}

const Register: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const coachCodeParam = searchParams.get("coachCode");
  const sessionIdParam = searchParams.get("session_id");
  const isStudentPlan = planParam === "eleve";

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    goalType: "",
    coachCode: coachCodeParam || "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [coachInfo, setCoachInfo] = useState<{ name: string; email: string } | null>(null);

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {};

    // Validation name
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation password
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    }

    // Validation confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Validation goalType
    if (!formData.goalType) {
      newErrors.goalType = "Veuillez sélectionner un objectif";
    }

    // Validation coachCode pour le plan élève (OBLIGATOIRE)
    if (isStudentPlan) {
      if (!formData.coachCode || !formData.coachCode.trim()) {
        newErrors.coachCode = "Le code d'invitation est requis pour le plan Élève";
      } else if (!coachInfo) {
        newErrors.coachCode = "Veuillez valider votre code d'invitation";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          goalType: formData.goalType,
          role: isStudentPlan ? "eleve" : "personnel",
          coachCode: isStudentPlan ? formData.coachCode?.trim() : undefined,
          sessionId: sessionIdParam || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.message || "Erreur lors de l'inscription",
        });
        setIsLoading(false);
        return;
      }

      // Stocker le token et les données utilisateur
      if (data.token && data.user) {
        login(data.token, data.user);

        // Afficher notification de succès selon le rôle
        const roleMessages = {
          personnel: "Compte personnel créé avec succès !",
          eleve: "Compte élève créé avec succès !",
          coach: "Compte coach créé avec succès !",
        };
        showToast(
          roleMessages[data.user.role as keyof typeof roleMessages] || "Compte créé avec succès !",
          "success"
        );

        // Rediriger vers la page de confirmation d'email
        window.location.href = `/email-confirmation?email=${encodeURIComponent(
          formData.email.toLowerCase().trim()
        )}`;
      }
    } catch (error) {
      setErrors({
        general: "Erreur de connexion. Vérifiez votre connexion internet.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validation en temps réel du code d'invitation
  const validateCoachCode = useCallback(async (code: string) => {
    if (!code || !code.trim()) {
      setCoachInfo(null);
      setErrors((prev) => ({
        ...prev,
        coachCode: undefined,
      }));
      return;
    }

    setValidatingCode(true);
    try {
      const response = await fetch(`${API_URL}/invitations/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCoachInfo({
          name: data.coach.name,
          email: data.coach.email,
        });
        setErrors((prev) => ({
          ...prev,
          coachCode: undefined,
        }));
      } else {
        setCoachInfo(null);
        setErrors((prev) => ({
          ...prev,
          coachCode: data.message || "Code d'invitation invalide",
        }));
      }
    } catch (error) {
      setCoachInfo(null);
      setErrors((prev) => ({
        ...prev,
        coachCode: "Erreur lors de la validation du code",
      }));
    } finally {
      setValidatingCode(false);
    }
  }, []);

  // Debounce pour la validation du code
  useEffect(() => {
    if (isStudentPlan && formData.coachCode && formData.coachCode.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        validateCoachCode(formData.coachCode || "");
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (isStudentPlan && (!formData.coachCode || !formData.coachCode.trim())) {
      setCoachInfo(null);
      setErrors((prev) => ({
        ...prev,
        coachCode: undefined,
      }));
    }
  }, [formData.coachCode, isStudentPlan, validateCoachCode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof RegisterErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const goalOptions = [
    { value: "weight_loss", label: "Perte de poids", emoji: "🔥" },
    { value: "weight_gain", label: "Prise de poids", emoji: "💪" },
    { value: "muscle_gain", label: "Prise de muscle", emoji: "🏋️" },
    { value: "maintenance", label: "Maintien", emoji: "⚖️" },
  ];

  return (
    <AuthLayout
      planche={isStudentPlan ? "Nouveau carnet — Élève" : "Nouveau carnet"}
      title={
        <>
          Ouvrir{" "}
          <span className="font-serif-it font-normal text-[var(--lavender)]">votre carnet.</span>
        </>
      }
      subtitle={
        isStudentPlan
          ? "Rejoignez votre coach sur MyTrackLy"
          : "Commencez votre parcours avec MyTrackLy"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erreur générale */}
        {errors.general && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl text-sm">
            {errors.general}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className={labelClass}>
            Nom complet
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClass(!!errors.name)}
            placeholder="Jean Dupont"
            autoComplete="name"
          />
          {errors.name && <p className={errorTextClass}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass(!!errors.email)}
            placeholder="votre@email.com"
            autoComplete="email"
          />
          {errors.email && <p className={errorTextClass}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={labelClass}>
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={inputClass(!!errors.password)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && <p className={errorTextClass}>{errors.password}</p>}
          <p className="mt-1.5 font-anno text-[10px] tracking-[0.08em] text-[var(--slate)]">
            Au moins 8 caractères, avec majuscule, minuscule et chiffre
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputClass(!!errors.confirmPassword)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className={errorTextClass}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Coach Code - Only for student plan */}
        {isStudentPlan && (
          <div className="border border-[var(--indigo)]/40 bg-[var(--indigo)]/[0.07] rounded-xl p-5">
            <label htmlFor="coachCode" className={labelClass}>
              Code d'invitation du coach <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="coachCode"
              name="coachCode"
              value={formData.coachCode || ""}
              onChange={handleChange}
              placeholder="Entrez le code unique fourni par votre coach"
              className={inputClass(!!errors.coachCode, !!coachInfo)}
              disabled={validatingCode}
            />
            {validatingCode && (
              <p className="mt-2 text-sm text-[var(--lavender)] flex items-center gap-2">
                <span
                  className="w-4 h-4 border-2 rounded-full animate-spin shrink-0"
                  style={{
                    borderColor: "currentColor",
                    borderTopColor: "transparent",
                    opacity: 0.8,
                  }}
                />
                Validation en cours...
              </p>
            )}
            {coachInfo && !validatingCode && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                <p className="text-sm font-semibold text-emerald-300">✓ Code valide</p>
                <p className="text-xs text-emerald-400/80 mt-1">
                  Coach : {coachInfo.name} ({coachInfo.email})
                </p>
              </div>
            )}
            {errors.coachCode && !validatingCode && (
              <p className={errorTextClass}>{errors.coachCode}</p>
            )}
            <p className="mt-2.5 text-xs text-[var(--lavender)]/70">
              Le code d'invitation est obligatoire pour créer un compte élève.
            </p>
          </div>
        )}

        {/* Goal Type */}
        <div>
          <label htmlFor="goalType" className={labelClass}>
            Votre objectif
          </label>
          <select
            id="goalType"
            name="goalType"
            value={formData.goalType}
            onChange={handleChange}
            className={inputClass(!!errors.goalType)}
          >
            <option value="">Sélectionnez un objectif</option>
            {goalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
          {errors.goalType && <p className={errorTextClass}>{errors.goalType}</p>}
        </div>

        {/* Bouton submit */}
        <button type="submit" disabled={isLoading} className={submitClass}>
          {isLoading ? (
            "Création du compte..."
          ) : (
            <>
              Créer mon compte <ArrowUpRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Lien vers connexion */}
      <div className="mt-8 pt-6 border-t border-[var(--hairline)] text-center">
        <p className="text-sm text-[var(--slate)]">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-[var(--lavender)] hover:text-white font-semibold transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
