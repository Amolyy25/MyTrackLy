"use client"

import { useEffect } from "react"

export function AnimationStyles() {
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes violet-pulse {
        0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
      }
      @keyframes success-pulse {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
        70% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }
      @keyframes flame-flicker {
        0%, 100% { transform: scale(1) rotate(-2deg); filter: brightness(1); }
        25% { transform: scale(1.05) rotate(1deg); filter: brightness(1.1); }
        50% { transform: scale(1.02) rotate(-1deg); filter: brightness(1.05); }
        75% { transform: scale(1.08) rotate(2deg); filter: brightness(1.15); }
      }
      @keyframes badge-shine {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes glow {
        0%, 100% { filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.5)); }
        50% { filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.8)); }
      }
      @keyframes slide-in-bounce {
        0% { transform: translateY(-20px); opacity: 0; }
        60% { transform: translateY(4px); opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes number-pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      @keyframes progress-fill {
        from { width: 0; }
      }
      @keyframes muscle-pulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .animate-violet-pulse { animation: violet-pulse 0.6s ease-out; }
      .animate-success-pulse { animation: success-pulse 0.6s ease-out; }
      .animate-flame { animation: flame-flicker 1.5s ease-in-out infinite; }
      .animate-badge-shine {
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: badge-shine 2s ease-in-out infinite;
      }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-glow { animation: glow 2s ease-in-out infinite; }
      .animate-slide-in { animation: slide-in-bounce 0.4s ease-out; }
      .animate-number-pop { animation: number-pop 0.3s ease-out; }
      .animate-progress-fill { animation: progress-fill 1s ease-out forwards; }
      .animate-muscle-pulse { animation: muscle-pulse 2s ease-in-out infinite; }
      .card-hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .card-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 30px -12px rgba(139, 92, 246, 0.3); }
      .btn-press:active { transform: scale(0.97); }
      .text-gradient {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .glass {
        background: rgba(17, 17, 19, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}
