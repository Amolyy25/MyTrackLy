import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import API_URL from "../../../config/api";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="MyTrackLy" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isStudentPlan ? "Créer un compte élève" : "Créer un compte"}
          </h1>
          <p className="text-gray-600">
            {isStudentPlan
              ? "Rejoignez votre coach sur MyTrackLy"
              : "Commencez votre parcours avec MyTrackLy"}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400`}
                placeholder="Jean Dupont"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400`}
                placeholder="votre@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Au moins 8 caractères, avec majuscule, minuscule et chiffre
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Coach Code - Only for student plan */}
            {isStudentPlan && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                <label
                  htmlFor="coachCode"
                  className="block text-sm font-semibold text-purple-900 mb-2"
                >
                  Code d'invitation du coach <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="coachCode"
                  name="coachCode"
                  value={formData.coachCode || ""}
                  onChange={handleChange}
                  placeholder="Entrez le code unique fourni par votre coach"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                    errors.coachCode
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : coachInfo
                      ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                      : "border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                  } focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400`}
                  disabled={validatingCode}
                />
                {validatingCode && (
                  <p className="mt-1 text-sm text-purple-600 flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Validation en cours...
                  </p>
                )}
                {coachInfo && !validatingCode && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-900">
                      ✓ Code valide
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Coach : {coachInfo.name} ({coachInfo.email})
                    </p>
                  </div>
                )}
                {errors.coachCode && !validatingCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.coachCode}</p>
                )}
                <p className="mt-2 text-sm text-purple-700">
                  Le code d'invitation est obligatoire pour créer un compte élève.
                </p>
              </div>
            )}

            {/* Goal Type */}
            <div>
              <label
                htmlFor="goalType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Votre objectif
              </label>
              <select
                id="goalType"
                name="goalType"
                value={formData.goalType}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                  errors.goalType
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Sélectionnez un objectif</option>
                {goalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
              {errors.goalType && (
                <p className="mt-1 text-sm text-red-600">{errors.goalType}</p>
              )}
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isLoading}
              onSubmit={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Retour à l'accueil */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
