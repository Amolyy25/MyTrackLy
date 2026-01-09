import { Request, Response, NextFunction } from "express";

/**
 * Rate limiter simple en mémoire
 * En production, utiliser redis-rate-limit ou express-rate-limit avec Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Nettoie le store toutes les 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware
 * @param windowMs Fenêtre de temps en millisecondes
 * @param maxRequests Nombre maximum de requêtes par fenêtre
 */
export function rateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes par défaut
  maxRequests: number = 100 // 100 requêtes par défaut
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = userId ? `user:${userId}` : `ip:${ip}`;

    const now = Date.now();
    const record = store[key];

    if (!record || record.resetTime < now) {
      // Nouvelle fenêtre
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        message: "Trop de requêtes. Veuillez réessayer plus tard.",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    next();
  };
}

/**
 * Rate limiter strict pour les réservations (10 par heure)
 */
export const reservationRateLimiter = rateLimiter(60 * 60 * 1000, 10);

/**
 * Rate limiter pour les appels Google Calendar OAuth (5 par heure)
 */
export const googleOAuthRateLimiter = rateLimiter(60 * 60 * 1000, 5);



