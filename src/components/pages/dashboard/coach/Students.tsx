import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import API_URL from "../../../../config/api";
import { useToast } from "../../../../contexts/ToastContext";
import ErrorDisplay from "../../../composants/ErrorDisplay";

interface Student {
  id: string;
  name: string;
  email: string;
  goalType: string | null;
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
  const [students, setStudents] = useState<Student[]>([]);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [creatingCode, setCreatingCode] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchInvitationCodes();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des élèves");
      }

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des codes");
      }

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
      setShowCreateCode(false);
      showToast("Code d'invitation généré avec succès !", "success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setCreatingCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Afficher une notification de succès
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes élèves</h1>
          <p className="mt-2 text-gray-600">
            Gérez vos élèves et créez des codes d'invitation
          </p>
        </div>
        <button
          onClick={() => setShowCreateCode(!showCreateCode)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {showCreateCode ? "Annuler" : "Créer un code d'invitation"}
        </button>
      </div>

      {/* Erreur */}
      {error && <ErrorDisplay error={error} fullScreen={false} />}

      {/* Formulaire de création de code */}
      {showCreateCode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Créer un code d'invitation
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Un code unique sera généré pour inviter un nouvel élève. Partagez ce
            code avec votre élève pour qu'il puisse créer son compte.
          </p>
          <button
            onClick={createInvitationCode}
            disabled={creatingCode}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingCode ? "Création..." : "Générer le code"}
          </button>
        </div>
      )}

      {/* Codes d'invitation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Codes d'invitation
        </h2>
        {invitationCodes.length === 0 ? (
          <p className="text-gray-600 text-sm">
            Aucun code d'invitation créé pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {invitationCodes.map((code) => (
              <div
                key={code.id}
                className={`p-4 rounded-lg border ${
                  code.used
                    ? "bg-gray-50 border-gray-200"
                    : "bg-indigo-50 border-indigo-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-lg font-mono font-bold text-gray-900">
                        {code.code}
                      </code>
                      {code.used ? (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                          Utilisé
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-200 text-green-700 text-xs font-medium rounded">
                          Disponible
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Créé le{" "}
                      {new Date(code.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {code.used && code.usedBy && (
                      <p className="text-sm text-gray-600 mt-1">
                        Utilisé par : {code.usedBy.name} ({code.usedBy.email})
                      </p>
                    )}
                    {code.used && code.usedAt && (
                      <p className="text-sm text-gray-600">
                        Le{" "}
                        {new Date(code.usedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  {!code.used && (
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="ml-4 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Copier
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liste des élèves */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Liste des élèves ({students.length})
        </h2>
        {students.length === 0 ? (
          <p className="text-gray-600 text-sm">
            Aucun élève n'a encore rejoint votre compte. Créez un code
            d'invitation pour commencer.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objectif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Séances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensurations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.goalType
                        ? {
                            weight_loss: "Perte de poids",
                            weight_gain: "Prise de poids",
                            muscle_gain: "Prise de muscle",
                            maintenance: "Maintien",
                          }[student.goalType] || student.goalType
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student._count.trainingSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student._count.measurements}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(student.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;

