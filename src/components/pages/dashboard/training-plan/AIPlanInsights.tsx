import React from "react";
import { Lightbulb, AlertTriangle, Flame, RefreshCw } from "lucide-react";
import { usePlanAISuggestions } from "../../../../hooks/usePlanAISuggestions";
import { AISuggestion } from "../../../../types";

interface AIPlanInsightsProps {
  planId: string;
}

function SuggestionIcon({ type }: { type: AISuggestion["type"] }) {
  if (type === "warning") {
    return (
      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  if (type === "motivation") {
    return (
      <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
      <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      </div>
    </div>
  );
}

const AIPlanInsights: React.FC<AIPlanInsightsProps> = ({ planId }) => {
  const { suggestions, isLoading, error, refresh, canRefresh, cooldownText } =
    usePlanAISuggestions(planId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>💡</span>
          <span>Suggestions IA</span>
        </h3>
        <button
          onClick={refresh}
          disabled={!canRefresh || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            enabled:hover:bg-indigo-50 dark:enabled:hover:bg-indigo-900/20
            text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
          title={!canRefresh ? cooldownText : "Générer des suggestions IA"}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Rafraîchir</span>
          {!canRefresh && cooldownText && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({cooldownText})
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Suggestions list */}
      {!isLoading && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
            >
              <SuggestionIcon type={suggestion.type} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {suggestion.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {suggestion.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && suggestions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cliquez sur "Rafraîchir" pour obtenir des suggestions personnalisées
          </p>
        </div>
      )}
    </div>
  );
};

export default AIPlanInsights;
