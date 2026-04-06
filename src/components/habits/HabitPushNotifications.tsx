import React, { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Check, Clock, AlertCircle } from "lucide-react";
import { Habit } from "../../types";
import { getCategoryEmoji } from "../../utils/habitHelpers";

const HABIT_NOTIF_KEY = "mytrackly_habit_notifs";

interface HabitNotifPrefs {
  enabled: boolean;
  habitTimes: Record<string, string>; // habitId -> HH:mm
}

function getPrefs(): HabitNotifPrefs {
  try {
    const stored = localStorage.getItem(HABIT_NOTIF_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, habitTimes: {} };
}

function savePrefs(prefs: HabitNotifPrefs) {
  localStorage.setItem(HABIT_NOTIF_KEY, JSON.stringify(prefs));
}

function canUseNotifications(): boolean {
  return "Notification" in window;
}

function isPermissionGranted(): boolean {
  return canUseNotifications() && Notification.permission === "granted";
}

function sendNotification(title: string, body: string, tag: string) {
  if (!isPermissionGranted()) return;
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag,
        vibrate: [200, 100, 200],
        renotify: true,
      });
    }).catch(() => {
      new Notification(title, { body, icon: "/pwa-192x192.png", tag });
    });
  } else {
    new Notification(title, { body, icon: "/pwa-192x192.png", tag });
  }
}

function scheduleHabitNotifications(
  habits: Habit[],
  prefs: HabitNotifPrefs
): number[] {
  const timers: number[] = [];
  const now = new Date();

  for (const habit of habits) {
    if (habit.completedToday) continue;

    const timeStr = prefs.habitTimes[habit.id] || habit.reminderTime;
    if (!timeStr) continue;

    const [h, m] = timeStr.split(":").map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);

    // If time already passed today, skip (don't schedule for tomorrow)
    if (target.getTime() <= now.getTime()) continue;

    // Check daysOfWeek if set
    if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
      if (!habit.daysOfWeek.includes(now.getDay())) continue;
    }

    const ms = target.getTime() - now.getTime();
    const emoji = habit.icon || getCategoryEmoji(habit.category);
    const streak = habit.currentStreak > 0 ? ` (${habit.currentStreak}j d'affilee)` : "";

    const timerId = window.setTimeout(() => {
      sendNotification(
        `${emoji} ${habit.name}`,
        `C'est l'heure ! N'oublie pas ton habitude${streak}`,
        `habit-${habit.id}`
      );
    }, ms);

    timers.push(timerId);
  }

  return timers;
}

interface HabitPushNotificationsProps {
  habits: Habit[];
}

const HabitPushNotifications: React.FC<HabitPushNotificationsProps> = ({ habits }) => {
  const [prefs, setPrefs] = useState<HabitNotifPrefs>(() => getPrefs());
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    canUseNotifications() ? Notification.permission : "denied"
  );
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => { timersRef.current.forEach((t) => clearTimeout(t)); };
  }, []);

  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    if (!prefs.enabled || permissionState !== "granted") {
      timersRef.current = [];
      return;
    }
    timersRef.current = scheduleHabitNotifications(habits, prefs);
  }, [prefs, permissionState, habits]);

  const requestPermission = async () => {
    if (!canUseNotifications()) return;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      const habitTimes: Record<string, string> = {};
      habits.forEach((h) => {
        if (h.reminderTime) habitTimes[h.id] = h.reminderTime;
      });
      const newPrefs = { enabled: true, habitTimes };
      setPrefs(newPrefs);
      savePrefs(newPrefs);
    }
  };

  const toggleEnabled = () => {
    if (!isPermissionGranted()) {
      requestPermission();
      return;
    }
    const newPrefs = { ...prefs, enabled: !prefs.enabled };
    if (!prefs.enabled) {
      habits.forEach((h) => {
        if (h.reminderTime && !newPrefs.habitTimes[h.id]) {
          newPrefs.habitTimes[h.id] = h.reminderTime;
        }
      });
    }
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  };

  const updateHabitTime = (habitId: string, time: string) => {
    const newPrefs = {
      ...prefs,
      habitTimes: { ...prefs.habitTimes, [habitId]: time },
    };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  };

  if (!canUseNotifications()) return null;

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-500" />
          Notifications push
        </h3>
        <button
          onClick={toggleEnabled}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            prefs.enabled && permissionState === "granted" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: prefs.enabled && permissionState === "granted" ? "translateX(22px)" : "translateX(2px)" }}
          />
        </button>
      </div>

      {permissionState === "denied" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Notifications bloquees. Autorisez-les dans les reglages du navigateur.
          </p>
        </div>
      )}

      {permissionState === "default" && !prefs.enabled && (
        <button
          onClick={requestPermission}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all active:scale-95"
        >
          <BellRing className="w-4 h-4" />
          Activer les notifications
        </button>
      )}

      {prefs.enabled && permissionState === "granted" && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Heure de rappel par habitude
          </p>
          {habits.map((habit) => {
            const emoji = habit.icon || getCategoryEmoji(habit.category);
            const time = prefs.habitTimes[habit.id] || habit.reminderTime || "";
            return (
              <div key={habit.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-lg">{emoji}</span>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{habit.name}</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateHabitTime(habit.id, e.target.value)}
                  className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                />
              </div>
            );
          })}
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Les rappels fonctionnent quand l'app est ouverte ou installee.
          </p>
        </div>
      )}
    </div>
  );
};

export default HabitPushNotifications;
