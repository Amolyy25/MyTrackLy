import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../pages/ui/dialog";
import { Button } from "../pages/ui/button";
import { Checkbox } from "../pages/ui/checkbox";
import { Label } from "../pages/ui/label";
import { Settings, X } from "lucide-react";
import { StatsPreferences } from "../../types";

interface CustomizePanelProps {
  preferences: StatsPreferences | null;
  availableCards: Array<{ id: string; label: string }>;
  onSave: (preferences: StatsPreferences) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomizePanel({
  preferences,
  availableCards,
  onSave,
  open,
  onOpenChange,
}: CustomizePanelProps) {
  const [visibleCards, setVisibleCards] = useState<string[]>(
    preferences?.visibleCards || []
  );

  React.useEffect(() => {
    if (preferences) {
      setVisibleCards(preferences.visibleCards);
    }
  }, [preferences]);

  const handleToggleCard = (cardId: string) => {
    setVisibleCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSave = () => {
    if (preferences) {
      onSave({
        ...preferences,
        visibleCards,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Personnaliser le tableau de bord
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Cartes visibles
            </Label>
            <div className="space-y-2">
              {availableCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={card.id}
                    checked={visibleCards.includes(card.id)}
                    onCheckedChange={() => handleToggleCard(card.id)}
                  />
                  <Label
                    htmlFor={card.id}
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {card.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
