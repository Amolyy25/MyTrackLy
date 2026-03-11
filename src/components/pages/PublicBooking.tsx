import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import API_URL from "../../config/api";
import { Button } from "./ui/button";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  User, 
  MapPin, 
  Euro,
  ArrowRight
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  location: string | null;
}

interface CoachProfile {
  name: string;
  services: Service[];
}

interface TimeSlot {
  start: string;
  end: string;
}

export default function PublicBooking() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  
  const [step, setStep] = useState<"service" | "date" | "form" | "success">("service");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/availability/public/${coachId}`);
        if (!res.ok) throw new Error("Profil introuvable");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        showToast("Impossible de charger le profil du coach.", "error");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    if (coachId) fetchProfile();
  }, [coachId, navigate, showToast]);

  const loadSlots = async (date: Date) => {
    try {
      if (!coachId) return;
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await fetch(`${API_URL}/availability/slots?coachId=${coachId}&date=${formattedDate}`);
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setSlots(data);
    } catch {
      setSlots([]);
      showToast("Impossible de charger les créneaux", "error");
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    loadSlots(date);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot) return;

    try {
      setIsSubmitting(true);
      const startDateTime = new Date(format(selectedDate, "yyyy-MM-dd") + "T" + selectedSlot.start);
      const endDateTime = new Date(format(selectedDate, "yyyy-MM-dd") + "T" + selectedSlot.end);

      const res = await fetch(`${API_URL}/calendar/public/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId,
          serviceId: selectedService.id,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          guestName,
          guestEmail,
          notes
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur de réservation");
      }

      setStep("success");
      showToast("Réservation confirmée avec succès !", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-5xl w-full bg-card rounded-[2rem] shadow-xl border border-border/40 flex flex-col md:flex-row overflow-hidden min-h-[650px] animate-in zoom-in-95 duration-500">
        
        {/* Left Sidebar - Recap */}
        <div className="w-full md:w-1/3 bg-muted/20 p-8 md:p-10 border-b md:border-b-0 md:border-r border-border/50 flex flex-col relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex-1">
            <div className="w-16 h-16 bg-background shadow-sm border border-border/50 rounded-2xl flex items-center justify-center mb-8 text-primary">
              <User className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">Réserver avec</p>
            <h1 className="text-3xl font-bold text-foreground mb-8">{profile.name}</h1>
            
            <div className="space-y-6">
              {selectedService && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h3 className="font-semibold text-lg text-foreground mb-4">{selectedService.title}</h3>
                  <div className="space-y-4 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Clock className="w-4 h-4 text-foreground" />
                      </div>
                      {selectedService.duration} min
                    </div>
                    {selectedService.location && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-foreground" />
                        </div>
                        {selectedService.location}
                      </div>
                    )}
                    {selectedService.price > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Euro className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-emerald-600 font-semibold">{selectedService.price} €</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedDate && selectedSlot && (
                <div className="pt-6 mt-6 border-t border-border/50 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="space-y-4 text-sm font-medium text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <span className="capitalize">{format(selectedDate, "EEEE d MMMM", { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      {selectedSlot.start}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="w-full md:w-2/3 p-8 md:p-12 relative">
          {step === "service" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-2">Choisissez une prestation</h2>
              <p className="text-muted-foreground mb-8">Sélectionnez le type de séance qui correspond à vos objectifs.</p>
              
              <div className="space-y-3 overflow-y-auto pr-2 pb-4 -mr-2">
                {profile.services.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setStep("date"); }}
                    className="w-full text-left p-6 rounded-2xl border border-border/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group bg-background relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{svc.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{svc.description}</p>
                    </div>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all group-hover:scale-110">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "date" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
              <div className="mb-6">
                <Button variant="ghost" onClick={() => { setStep("service"); setSelectedService(null); }} className="-ml-4 gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </Button>
              </div>
              
              <h2 className="text-2xl font-bold mb-8">Sélectionnez une date et une heure</h2>
              
              <div className="max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-lg capitalize text-foreground">
                    {format(currentWeekStart, "MMMM yyyy", { locale: fr })}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 hover:bg-muted" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 hover:bg-muted" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-8">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = addDays(currentWeekStart, i);
                    const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                    const isPast = date < new Date() && format(date, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd");
                    
                    return (
                      <button
                        key={i}
                        disabled={isPast}
                        onClick={() => handleDateSelect(date)}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all 
                          ${isPast ? 'opacity-40 cursor-not-allowed bg-muted/30' 
                          : isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                          : 'hover:bg-muted/60 border border-transparent hover:border-border/60'}`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {format(date, "EEE", { locale: fr })}
                        </span>
                        <span className="text-lg font-bold mt-1">{format(date, "d")}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <h4 className="font-medium text-sm text-foreground mb-4">Créneaux disponibles</h4>
                    {slots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {slots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                            className="py-3 px-4 rounded-xl text-sm font-semibold border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 hover:shadow-md"
                          >
                            {slot.start}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 px-4 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border/60">
                        Aucun créneau disponible pour cette journée.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "form" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
              <div className="mb-6">
                <Button variant="ghost" onClick={() => { setStep("date"); setSelectedSlot(null); }} className="-ml-4 gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
              </div>
              
              <div className="max-w-md">
                <h2 className="text-2xl font-bold mb-2">Vos informations</h2>
                <p className="text-muted-foreground mb-8">Veuillez remplir ces informations pour confirmer la réservation.</p>

                <form onSubmit={handleBook} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Nom complet</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-5 py-3.5 bg-background border border-border/80 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Adresse email</label>
                    <input 
                      required
                      type="email"
                      className="w-full px-5 py-3.5 bg-background border border-border/80 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      placeholder="jean.dupont@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Message (optionnel)</label>
                    <textarea 
                      className="w-full px-5 py-3.5 bg-background border border-border/80 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all min-h-[120px] resize-none placeholder:text-muted-foreground/60"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Précisez votre niveau, vos besoins spécifiques..."
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-7 text-lg font-bold rounded-xl mt-4 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    {isSubmitting ? "Confirmation en cours..." : "Confirmer"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="animate-in zoom-in-95 duration-500 h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 rotate-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 -rotate-3" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">C'est réservé !</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
                Votre créneau a bien été bloqué. Vous allez recevoir un récapitulatif par email d'ici quelques instants.
              </p>
              <Button 
                onClick={() => window.location.href = window.location.origin}
                variant="outline"
                className="rounded-xl px-10 py-6 text-base font-semibold border-border/80 hover:bg-muted"
              >
                Terminer
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* MytrackLy Branding Footer */}
      <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
          Propulsé par <span className="font-bold text-foreground">MytrackLy</span>
        </p>
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors hover:underline mt-1 inline-block">
          Créez votre propre plateforme pour coach
        </a>
      </div>
    </div>
  );
}
