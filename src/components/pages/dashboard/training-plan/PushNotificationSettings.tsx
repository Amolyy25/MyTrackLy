import React, { useState, useEffect } from "react";
import { Bell, BellOff, Check, AlertCircle, Clock } from "lucide-react";
import { PlanDay } from "../../../../types";
import { DAYS_FULL_FR, getTrainingTypeLabel, getTrainingTypeEmoji } from "../../../../utils/trainingPlanHelpers";

interface PushNotificationSettingsProps {
  planId: string;
  days: PlanDay[];
}

const NOTIFICATION_KEY = "mytrackly_notifications";
const REMINDER_OFFSET_KEY = "mytrackly_reminder_offset";

interface NotificationPrefs {
  enabled: boolean;
  enabledDays: number[]; // dayOfWeek values
  reminderMinutes: number; // minutes before session
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
 * Schedule a notification for the next occurrence of a training day.
 * Uses setTimeout since Service Worker push requires a server.
 * For a PWA, this works when the app tab is open.
 */
function scheduleNextNotification(day: PlanDay, reminderMinutes: number): number | null {
  const now = new Date();
  const todayDow = now.getDay();

  // Find next occurrence of this day
  let daysUntil = day.dayOfWeek - todayDow;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0) {
    // Check if time already passed today
    const [h, m] = day.timeOfDay.split(":").map(Number);
    const sessionTime = new Date(now);
    sessionTime.setHours(h, m, 0, 0);
    sessionTime.setMinutes(sessionTime.getMinutes() - reminderMinutes);
    if (now >= sessionTime) daysUntil = 7;
  }

  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysUntil);
  const [h, m] = day.timeOfDay.split(":").map(Number);
  nextDate.setHours(h, m, 0, 0);
  nextDate.setMinutes(nextDate.getMinutes() - reminderMinutes);

  const ms = nextDate.getTime() - now.getTime();
  if (ms <= 0 || ms > 7 * 24 * 60 * 60 * 1000) return null;

  const typeLabel = getTrainingTypeLabel(day.trainingType, day.customType);
  const typeEmoji = getTrainingTypeEmoji(day.trainingType);
  const dayName = DAYS_FULL_FR[day.dayOfWeek];
  const label = day.label ? `${day.label} — ` : "";

  const timerId = window.setTimeout(() => {
    if (isPermissionGranted()) {
      new Notification("MyTrackLy — C'est l'heure !", {
        body: `${label}${typeEmoji} ${typeLabel} prevu a ${day.timeOfDay} (${dayName})`,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: `plan-reminder-${day.id}`,
      });
    }
  }, ms);

  return timerId;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ planId, days }) => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => getPrefs(planId));
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    canUseNotifications() ? Notification.permission : "denied"
  );
  const [timers, setTimers] = useState<number[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [timers]);

  // Re-schedule when prefs change
  useEffect(() => {
    // Clear old timers
    timers.forEach((t) => clearTimeout(t));

    if (!prefs.enabled || permissionState !== "granted") {
      setTimers([]);
      return;
    }

    const newTimers: number[] = [];
    for (const day of days) {
      if (prefs.enabledDays.includes(day.dayOfWeek)) {
        const t = scheduleNextNotification(day, prefs.reminderMinutes);
        if (t !== null) newTimers.push(t);
      }
    }
    setTimers(newTimers);
  }, [prefs, permissionState, days]);

  const requestPermission = async () => {
    if (!canUseNotifications()) return;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      const newPrefs = { ...prefs, enabled: true, enabledDays: days.map((d) => d.dayOfWeek) };
      setPrefs(newPrefs);
      savePrefs(planId, newPrefs);
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
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
              prefs.enabled && permissionState === "granted" ? "translate-x-5.5 left-0" : "left-0.5"
            }`}
            style={{
              transform: prefs.enabled && permissionState === "granted" ? "translateX(22px)" : "translateX(0)",
            }}
          />
        </button>
      </div>

      {permissionState === "denied" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-400">
            Les notifications sont bloquees. Autorisez-les dans les parametres de votre navigateur.
          </p>
        </div>
      )}

      {prefs.enabled && permissionState === "granted" && (
        <div className="space-y-3">
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
        </div>
      )}
    </div>
  );
};

export default PushNotificationSettings;
