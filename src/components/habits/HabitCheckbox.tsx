import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface HabitCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showConfetti?: boolean;
}

export function HabitCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  size = "lg",
  showConfetti = false,
}: HabitCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    onCheckedChange(!checked);
    
    // Trigger confetti animation if checking
    if (!checked && showConfetti) {
      setTimeout(() => setIsAnimating(false), 700);
    } else {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Minimum 44x44px for mobile touch targets
  const sizeClasses = {
    sm: "h-10 w-10 min-h-[44px] min-w-[44px]",
    md: "h-11 w-11 min-h-[44px] min-w-[44px]",
    lg: "h-12 w-12 min-h-[44px] min-w-[44px]",
  };

  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-95",
        sizeClasses[size],
        checked
          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
          : "bg-muted hover:bg-muted/80 border-2 border-border hover:border-primary/50"
      )}
      aria-label={checked ? "Marquer comme non complété" : "Marquer comme complété"}
    >
      {checked ? (
        <CheckCircle2 
          className={cn(
            "transition-all duration-200",
            iconSizeClasses[size],
            isAnimating && "scale-110"
          )} 
        />
      ) : (
        <Circle 
          className={cn(
            "transition-all duration-200 text-muted-foreground",
            iconSizeClasses[size]
          )} 
        />
      )}
      
      {/* Success pulse animation */}
      {isAnimating && checked && (
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
      )}
      
      {/* Confetti effect */}
      {isAnimating && checked && showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1.5 h-1.5 rounded-full",
                i % 4 === 0 ? "bg-yellow-400" : 
                i % 4 === 1 ? "bg-pink-400" : 
                i % 4 === 2 ? "bg-blue-400" : "bg-emerald-400"
              )}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%)`,
                animation: `confetti-burst-${i} 0.7s ease-out forwards`,
              }}
            />
          ))}
        </div>
      )}
      
      <style>{`
        ${[...Array(12)].map((_, i) => {
          const angle = i * 30;
          const distance = 35 + Math.random() * 15;
          return `
            @keyframes confetti-burst-${i} {
              0% {
                transform: translate(-50%, -50%) rotate(${angle}deg) translateY(0);
                opacity: 1;
                scale: 1;
              }
              100% {
                transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px);
                opacity: 0;
                scale: 0.5;
              }
            }
          `;
        }).join("")}
      `}</style>
    </button>
  );
}
