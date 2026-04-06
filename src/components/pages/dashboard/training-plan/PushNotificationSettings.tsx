import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, BellRing, Check, AlertCircle, Clock, Send } from "lucide-react";
import { PlanDay } from "../../../../types";
import { DAYS_FULL_FR, getTrainingTypeLabel, getTrainingTypeEmoji } from "../../../../utils/trainingPlanHelpers";
import { useToast } from "../../../../contexts/ToastContext";

interface PushNotificationSettingsProps {
  planId: string;
  days: PlanDay[];
}

const NOTIFICATION_KEY = "mytrackly_notifications";

interface NotificationPrefs {
  enabled: boolean;
  enabledDays: number[];
  reminderMinutes: number;
}

function getPrefs(planId: string): NotificationPrefs {
  try {
    const stored = localStorage.getItem(`${NOTIFICATION_KEY}_${planId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, enabledDays: [], reminderMinutes: 30 };
}

function savePrefs(planId: string, prefs: NotificationPrefs) {
  localStorage.setItem(`${NOTIFICATION_KEY}_${planId}`, JSON.stringify(prefs));
}

function canUseNotifications(): boolean {
  return "Notification" in window;
}

function isPermissionGranted(): boolean {
  return canUseNotifications() && Notification.permission === "granted";
}

/**
 * Send a notification immediately (used for test & scheduled).
 */
function sendNotification(title: string, body: string, tag?: string) {
  if (!isPermissionGranted()) return;

  // Try service worker notifications first (works better on mobile/PWA)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: tag || "mytrackly-reminder",
        vibrate: [200, 100, 200],
        renotify: true,
      });
    }).catch(() => {
      // Fallback to basic Notification API
      new Notification(title, {
        body,
        icon: "/pwa-192x192.png",
        tag: tag || "mytrackly-reminder",
      });
    });
  } else {
    new Notification(title, {
      body,
      icon: "/pwa-192x192.png",
      tag: tag || "mytrackly-reminder",
    });
  }
}

/**
 * Schedule notifications for the next occurrence of each enabled training day.
 * Returns timer IDs for cleanup.
 */
function scheduleNotifications(
  days: PlanDay[],
  enabledDays: number[],
  reminderMinutes: number
): number[] {
  const timers: number[] = [];
  const now = new Date();
  const todayDow = now.getDay();

  for (const day of days) {
    if (!enabledDays.includes(day.dayOfWeek)) continue;

    let daysUntil = day.dayOfWeek - todayDow;
    if (daysUntil < 0) daysUntil += 7;

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysUntil);
    const [h, m] = day.timeOfDay.split(":").map(Number);
    nextDate.setHours(h, m, 0, 0);
    nextDate.setMinutes(nextDate.getMinutes() - reminderMinutes);

    // If the time already passed today, schedule for next week
    if (daysUntil === 0 && nextDate.getTime() <= now.getTime()) {
      nextDate.setDate(nextDate.getDate() + 7);
    }

    const ms = nextDate.getTime() - now.getTime();
    if (ms <= 0 || ms > 7 * 24 * 60 * 60 * 1000) continue;

    const typeLabel = getTrainingTypeLabel(day.trainingType, day.customType);
    const typeEmoji = getTrainingTypeEmoji(day.trainingType);
    const dayName = DAYS_FULL_FR[day.dayOfWeek];
    const label = day.label ? `${day.label} — ` : "";

    const timerId = window.setTimeout(() => {
      sendNotification(
        "MyTrackLy — C'est l'heure !",
        `${label}${typeEmoji} ${typeLabel} prevu a ${day.timeOfDay} (${dayName})`,
        `plan-reminder-${day.id}`
      );
    }, ms);

    timers.push(timerId);
  }

  return timers;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ planId, days }) => {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => getPrefs(planId));
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    canUseNotifications() ? Notification.permission : "denied"
  );
  const timersRef = useRef<number[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Re-schedule when prefs change
  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));

    if (!prefs.enabled || permissionState !== "granted") {
      timersRef.current = [];
      return;
    }

    timersRef.current = scheduleNotifications(days, prefs.enabledDays, prefs.reminderMinutes);
  }, [prefs, permissionState, days]);

  const requestPermission = async () => {
    if (!canUseNotifications()) return;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      const newPrefs = { ...prefs, enabled: true, enabledDays: days.map((d) => d.dayOfWeek) };
      setPrefs(newPrefs);
      savePrefs(planId, newPrefs);
      showToast("Notifications activees !", "success");
    } else {
      showToast("Notifications refusees par le navigateur", "error");
    }
  };

  const toggleEnabled = () => {
    if (!isPermissionGranted()) {
      requestPermission();
      return;
    }
    const newPrefs = {
      ...prefs,
      enabled: !prefs.enabled,
      enabledDays: !prefs.enabled ? days.map((d) => d.dayOfWeek) : prefs.enabledDays,
    };
    setPrefs(newPrefs);
    savePrefs(planId, newPrefs);
  };

  const toggleDay = (dow: number) => {
    const newEnabledDays = prefs.enabledDays.includes(dow)
      ? prefs.enabledDays.filter((d) => d !== dow)
      : [...prefs.enabledDays, dow];
    const newPrefs = { ...prefs, enabledDays: newEnabledDays };
    setPrefs(newPrefs);
    savePrefs(planId, newPrefs);
  };

  const changeOffset = (minutes: number) => {
    const newPrefs = { ...prefs, reminderMinutes: minutes };
    setPrefs(newPrefs);
    savePrefs(planId, newPrefs);
  };

  const handleTestNotification = () => {
    if (!isPermissionGranted()) {
      showToast("Autorisez d'abord les notifications", "error");
      return;
    }

    const nextDay = days[0];
    const label = nextDay?.label || "Seance";
    const emoji = nextDay ? getTrainingTypeEmoji(nextDay.trainingType) : "💪";
    const type = nextDay ? getTrainingTypeLabel(nextDay.trainingType, nextDay.customType) : "Entrainement";

    sendNotification(
      "MyTrackLy — Test",
      `${emoji} ${label} — ${type} dans ${prefs.reminderMinutes} min !`,
      "test-notification"
    );
    showToast("Notification de test envoyee !", "success");
  };

  if (!canUseNotifications()) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <BellOff className="w-4 h-4" />
          <p className="text-xs font-medium">Les notifications ne sont pas supportees par ce navigateur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          Rappels
        </h3>
        <button
          onClick={toggleEnabled}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            prefs.enabled && permissionState === "granted"
              ? "bg-indigo-600"
              : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
            style={{
              transform: prefs.enabled && permissionState === "granted" ? "translateX(22px)" : "translateX(2px)",
            }}
          />
        </button>
      </div>

      {permissionState === "default" && !prefs.enabled && (
        <button
          onClick={requestPermission}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95"
        >
          <BellRing className="w-4 h-4" />
          Activer les notifications
        </button>
      )}

      {permissionState === "denied" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-400">
            Les notifications sont bloquees. Allez dans Reglages {">"} Safari {">"} Notifications pour les autoriser.
          </p>
        </div>
      )}

      {prefs.enabled && permissionState === "granted" && (
        <div className="space-y-3">
          {/* Test button */}
          <button
            onClick={handleTestNotification}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            Envoyer une notification test
          </button>

          {/* Reminder offset */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Rappel avant la seance
            </p>
            <div className="flex gap-2">
              {[15, 30, 60, 120].map((m) => (
                <button
                  key={m}
                  onClick={() => changeOffset(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    prefs.reminderMinutes === m
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {m < 60 ? `${m}min` : `${m / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Day toggles */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Jours actifs
            </p>
            <div className="space-y-1.5">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.dayOfWeek)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    prefs.enabledDays.includes(day.dayOfWeek)
                      ? "bg-indigo-500/5 border-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getTrainingTypeEmoji(day.trainingType)}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {DAYS_FULL_FR[day.dayOfWeek]}
                    </span>
                    <span className="text-xs text-slate-400">{day.timeOfDay}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    prefs.enabledDays.includes(day.dayOfWeek)
                      ? "bg-indigo-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}>
                    {prefs.enabledDays.includes(day.dayOfWeek) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Les rappels fonctionnent quand l'app est ouverte. Pour des notifications fiables en arriere-plan, gardez un onglet MyTrackLy ouvert.
          </p>
        </div>
      )}
    </div>
  );
};

export default PushNotificationSettings;
