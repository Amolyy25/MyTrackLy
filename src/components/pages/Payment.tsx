import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../composants/Navbar";
import Footer from "../composants/Footer";

type PlanType = "personnel" | "eleve" | "coach";

interface PlanInfo {
  id: PlanType;
  name: string;
  price: number;
  description: string;
}

const plans: Record<PlanType, PlanInfo> = {
  personnel: {
    id: "personnel",
    name: "Personnel",
    price: 5,
    description: "Suivi personnel complet",
  },
  eleve: {
    id: "eleve",
    name: "Élève",
    price: 15,
    description: "Accompagnement par un coach",
  },
  coach: {
    id: "coach",
    name: "Coach",
    price: 50,
    description: "Solution complète pour gérer vos élèves",
  },
};

interface PaymentFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardName: string;
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  coachCode?: string;
}

interface PaymentErrors {
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
  cardName?: string;
  billingName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  coachCode?: string;
  general?: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan") as PlanType | null;

  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(
    planParam && plans[planParam] ? planParam : null
  );
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardName: "",
    billingName: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingCountry: "France",
    coachCode: "",
  });
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedPlan && planParam && plans[planParam]) {
      setSelectedPlan(planParam);
    } else if (!selectedPlan) {
      // Si aucun plan n'est sélectionné, rediriger vers la page des plans
      navigate("/plans");
    }
  }, [planParam, selectedPlan, navigate]);

  const validate = (): boolean => {
    const newErrors: PaymentErrors = {};

    // Validation carte bancaire
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Le numéro de carte est requis";
    } else if (
      !/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(
        formData.cardNumber.replace(/\s/g, "")
      )
    ) {
      newErrors.cardNumber = "Format de carte invalide (16 chiffres)";
    }

    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = "La date d'expiration est requise";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = "Format invalide (MM/AA)";
    }

    if (!formData.cardCVC.trim()) {
      newErrors.cardCVC = "Le code CVC est requis";
    } else if (!/^\d{3,4}$/.test(formData.cardCVC)) {
      newErrors.cardCVC = "Format invalide (3 ou 4 chiffres)";
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Le nom sur la carte est requis";
    }

    // Validation facturation
    if (!formData.billingName.trim()) {
      newErrors.billingName = "Le nom est requis";
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = "L'adresse est requise";
    }

    if (!formData.billingCity.trim()) {
      newErrors.billingCity = "La ville est requise";
    }

    if (!formData.billingPostalCode.trim()) {
      newErrors.billingPostalCode = "Le code postal est requis";
    }

    if (!formData.billingCountry.trim()) {
      newErrors.billingCountry = "Le pays est requis";
    }

    // Validation code coach pour le plan élève
    if (selectedPlan === "eleve" && !formData.coachCode?.trim()) {
      newErrors.coachCode = "Le code coach est requis pour le plan Élève";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Formatage automatique pour le numéro de carte
    if (name === "cardNumber") {
      const cleaned = value.replace(/\s/g, "").replace(/\D/g, "");
      const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    }
    // Formatage automatique pour la date d'expiration
    else if (name === "cardExpiry") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    }
    // Formatage pour le CVC (uniquement des chiffres)
    else if (name === "cardCVC") {
      const cleaned = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulation du paiement (pour l'instant, juste rediriger vers register)
    // Plus tard, on intégrera un vrai système de paiement (Stripe, etc.)
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set("plan", selectedPlan!);
      if (selectedPlan === "eleve" && formData.coachCode) {
        params.set("coachCode", formData.coachCode);
      }
      navigate(`/register?${params.toString()}`);
    }, 1000);
  };

  if (!selectedPlan) {
    return null;
  }

  const plan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Finalisez votre abonnement
            </h1>
            <p className="text-xl text-gray-600">
              Plan sélectionné :{" "}
              <span className="font-semibold">{plan.name}</span> - {plan.price}
              €/mois
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire de paiement */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Informations de paiement
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Code coach pour plan élève */}
                  {selectedPlan === "eleve" && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                      <label
                        htmlFor="coachCode"
                        className="block text-sm font-semibold text-purple-900 mb-2"
                      >
                        Code d'invitation du coach *
                      </label>
                      <input
                        type="text"
                        id="coachCode"
                        name="coachCode"
                        value={formData.coachCode}
                        onChange={handleChange}
                        placeholder="Entrez le code fourni par votre coach"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.coachCode
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors bg-white`}
                      />
                      {errors.coachCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.coachCode}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-purple-700">
                        Vous devez avoir un code d'invitation d'un coach pour
                        vous inscrire au plan Élève.
                      </p>
                    </div>
                  )}

                  {/* Carte bancaire */}
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Numéro de carte *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.cardNumber
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2 transition-colors bg-white`}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="cardExpiry"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Date d'expiration *
                      </label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.cardExpiry
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors bg-white`}
                      />
                      {errors.cardExpiry && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="cardCVC"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        CVC *
                      </label>
                      <input
                        type="text"
                        id="cardCVC"
                        name="cardCVC"
                        value={formData.cardCVC}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.cardCVC
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors bg-white`}
                      />
                      {errors.cardCVC && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cardCVC}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cardName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Nom sur la carte *
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="Jean Dupont"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.cardName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      } focus:outline-none focus:ring-2 transition-colors bg-white`}
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardName}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Informations de facturation
                    </h3>

                    <div>
                      <label
                        htmlFor="billingName"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="billingName"
                        name="billingName"
                        value={formData.billingName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.billingName
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors bg-white`}
                      />
                      {errors.billingName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.billingName}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="billingAddress"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Adresse *
                      </label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.billingAddress
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors bg-white`}
                      />
                      {errors.billingAddress && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.billingAddress}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor="billingCity"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Ville *
                        </label>
                        <input
                          type="text"
                          id="billingCity"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.billingCity
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2 transition-colors bg-white`}
                        />
                        {errors.billingCity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billingCity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="billingPostalCode"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Code postal *
                        </label>
                        <input
                          type="text"
                          id="billingPostalCode"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.billingPostalCode
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2 transition-colors bg-white`}
                        />
                        {errors.billingPostalCode && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="billingCountry"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Pays *
                      </label>
                      <select
                        id="billingCountry"
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.billingCountry
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors bg-white`}
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Canada">Canada</option>
                        <option value="Autre">Autre</option>
                      </select>
                      {errors.billingCountry && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.billingCountry}
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? "Traitement en cours..."
                      : `Payer ${plan.price}€/mois`}
                  </button>
                </form>
              </div>
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                  Résumé de la commande
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-gray-900">
                      {plan.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix mensuel</span>
                    <span className="font-semibold text-gray-900">
                      {plan.price}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Essai gratuit</span>
                    <span className="font-semibold text-green-600">
                      14 jours
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {plan.price}€/mois
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-indigo-700">
                    <strong>Essai gratuit de 14 jours</strong>
                    <br />
                    Aucun paiement ne sera effectué avant la fin de votre essai.
                    Vous pouvez annuler à tout moment.
                  </p>
                </div>

                <Link
                  to="/plans"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Changer de plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;


