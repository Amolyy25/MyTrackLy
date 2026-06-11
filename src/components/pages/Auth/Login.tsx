import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import API_URL from "../../../config/api";
import { AuthLayout, labelClass, inputClass, errorTextClass, submitClass } from "./AuthLayout";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: LoginErrors = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation password
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Erreur de connexion" });
        setIsLoading(false);
        return;
      }

      // Stocker le token et les données utilisateur
      if (data.token && data.user) {
        login(data.token, data.user);
        // Rediriger vers le dashboard (DashboardHome gérera la redirection selon le rôle)
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setErrors({
        general: "Erreur de connexion. Vérifiez votre connexion internet.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <AuthLayout
      planche="Accès au carnet"
      title={
        <>
          Reprendre{" "}
          <span className="font-serif-it font-normal text-[var(--lavender)]">la séance.</span>
        </>
      }
      subtitle="Connectez-vous à votre compte MyTrackLy"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erreur générale */}
        {errors.general && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl text-sm">
            {errors.general}
          </div>
        )}

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
            autoComplete="current-password"
          />
          {errors.password && <p className={errorTextClass}>{errors.password}</p>}
        </div>

        {/* Mot de passe oublié */}
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--lavender)] hover:text-white transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Bouton submit */}
        <button type="submit" disabled={isLoading} className={submitClass}>
          {isLoading ? (
            "Connexion..."
          ) : (
            <>
              Se connecter <ArrowUpRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Lien vers inscription */}
      <div className="mt-8 pt-6 border-t border-[var(--hairline)] text-center">
        <p className="text-sm text-[var(--slate)]">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-[var(--lavender)] hover:text-white font-semibold transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
