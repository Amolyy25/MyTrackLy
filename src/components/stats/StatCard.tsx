import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../pages/ui/card";
import { Eye, EyeOff, Pin, PinOff, Maximize2 } from "lucide-react";
import { Button } from "../pages/ui/button";
import { cn } from "../../lib/utils";

interface StatCardProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  isPinned?: boolean;
  onToggleVisibility?: () => void;
  onTogglePin?: () => void;
  onExpand?: () => void;
  showActions?: boolean;
}

export function StatCard({
  id,
  title,
  description,
  children,
  className,
  isVisible = true,
  isPinned = false,
  onToggleVisibility,
  onTogglePin,
  onExpand,
  showActions = true,
}: StatCardProps) {
  if (!isVisible) return null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        isPinned && "ring-2 ring-primary/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onTogglePin && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onTogglePin}
                  className="h-7 w-7"
                >
                  {isPinned ? (
                    <PinOff className="h-3.5 w-3.5" />
                  ) : (
                    <Pin className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
              {onExpand && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onExpand}
                  className="h-7 w-7"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleVisibility}
                  className="h-7 w-7"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
