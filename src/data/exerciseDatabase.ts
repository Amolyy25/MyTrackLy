/**
 * Base de données client-side des exercices prédéfinis.
 * Contient descriptions, instructions, muscles ciblés, bienfaits, etc.
 */

export interface ExerciseInfo {
  name: string;
  displayName: string;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: "strength" | "cardio" | "flexibility" | "other";
  instructions: string[];
  benefits: string[];
  commonMistakes: string[];
  tips: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string[];
  videoSearchQuery: string;
}

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const EXERCISE_DATABASE: ExerciseInfo[] = [
  // ─── JAMBES ───
  {
    name: "Squat",
    displayName: "Squat",
    description:
      "Mouvement fondamental de musculation qui consiste à fléchir les genoux et les hanches pour descendre le corps, puis à remonter. C'est l'exercice roi pour le développement des jambes et du tronc.",
    primaryMuscles: ["Quadriceps", "Fessiers"],
    secondaryMuscles: ["Ischio-jambiers", "Lombaires", "Abdominaux"],
    category: "strength",
    instructions: [
      "Placez la barre sur vos trapèzes, pieds écartés à la largeur des épaules.",
      "Inspirez et descendez en poussant les hanches vers l'arrière, genoux alignés avec les pieds.",
      "Descendez jusqu'à ce que vos cuisses soient au moins parallèles au sol.",
      "Poussez dans vos talons pour remonter en expirant, en gardant le dos droit.",
    ],
    benefits: [
      "Développe la force et la masse musculaire des jambes",
      "Stimule la production de testostérone et d'hormone de croissance",
      "Améliore la stabilité du tronc et la posture",
      "Brûle un maximum de calories grâce à la sollicitation de nombreux muscles",
    ],
    commonMistakes: [
      "Genoux qui rentrent vers l'intérieur (valgus) — poussez-les vers l'extérieur",
      "Dos arrondi — gardez la poitrine haute et le regard devant",
      "Talons qui se soulèvent — travaillez la mobilité de cheville",
    ],
    tips: [
      "Échauffez-vous avec des séries légères avant de charger lourd",
      "Utilisez une ceinture de force pour les charges lourdes",
      "Variez la largeur de pieds pour cibler différemment les muscles",
    ],
    difficulty: "intermediate",
    equipment: ["Barre", "Rack à squat"],
    videoSearchQuery: "squat barre musculation technique",
  },
  {
    name: "Presse à cuisses",
    displayName: "Presse à cuisses",
    description:
      "Exercice de musculation sur machine où l'on pousse une plateforme avec les pieds. Permet de travailler les jambes avec un risque réduit pour le dos par rapport au squat.",
    primaryMuscles: ["Quadriceps", "Fessiers"],
    secondaryMuscles: ["Ischio-jambiers", "Mollets"],
    category: "strength",
    instructions: [
      "Installez-vous sur la machine, dos bien plaqué contre le dossier.",
      "Placez vos pieds à la largeur des épaules sur la plateforme.",
      "Déverrouillez la sécurité et descendez la plateforme en contrôlant le mouvement.",
      "Poussez avec vos talons pour remonter sans verrouiller complètement les genoux.",
    ],
    benefits: [
      "Développe les quadriceps et fessiers en toute sécurité",
      "Permet de charger lourd sans stress sur le dos",
      "Excellent pour les débutants ou la rééducation",
    ],
    commonMistakes: [
      "Descendre trop bas, ce qui décolle le bas du dos du dossier",
      "Verrouiller les genoux en haut du mouvement",
      "Placer les pieds trop bas sur la plateforme",
    ],
    tips: [
      "Pieds hauts sur la plateforme = plus de fessiers, pieds bas = plus de quadriceps",
      "Ne bloquez jamais vos genoux en extension complète",
    ],
    difficulty: "beginner",
    equipment: ["Presse à cuisses"],
    videoSearchQuery: "presse à cuisses leg press technique",
  },
  {
    name: "Fentes",
    displayName: "Fentes",
    description:
      "Exercice unilatéral où l'on fait un grand pas en avant puis on fléchit les deux genoux. Excellent pour travailler l'équilibre et corriger les déséquilibres musculaires.",
    primaryMuscles: ["Quadriceps", "Fessiers"],
    secondaryMuscles: ["Ischio-jambiers", "Mollets", "Abdominaux"],
    category: "strength",
    instructions: [
      "Debout, pieds à la largeur des hanches, haltères en main ou barre sur les trapèzes.",
      "Faites un grand pas en avant avec une jambe.",
      "Fléchissez les deux genoux à 90° — le genou arrière frôle le sol.",
      "Poussez avec le pied avant pour revenir à la position de départ.",
    ],
    benefits: [
      "Corrige les déséquilibres de force entre les jambes",
      "Améliore l'équilibre et la coordination",
      "Travaille les fessiers en profondeur",
    ],
    commonMistakes: [
      "Genou avant qui dépasse largement la pointe du pied",
      "Pas trop court, ce qui surcharge le genou",
      "Tronc penché en avant au lieu de rester droit",
    ],
    tips: [
      "Regardez droit devant pour maintenir l'équilibre",
      "Commencez sans charge pour maîtriser le mouvement",
    ],
    difficulty: "beginner",
    equipment: ["Haltères (optionnel)", "Barre (optionnel)"],
    videoSearchQuery: "fentes avant musculation technique",
  },
  {
    name: "Fentes bulgares",
    displayName: "Fentes bulgares",
    description:
      "Variante avancée des fentes où le pied arrière est surélevé sur un banc. Augmente l'amplitude du mouvement et l'activation des fessiers.",
    primaryMuscles: ["Quadriceps", "Fessiers"],
    secondaryMuscles: ["Ischio-jambiers", "Abdominaux"],
    category: "strength",
    instructions: [
      "Placez un pied sur un banc derrière vous, lacets vers le bas.",
      "Tenez des haltères de chaque côté ou utilisez une barre.",
      "Descendez en fléchissant le genou avant jusqu'à 90°.",
      "Poussez avec le talon du pied avant pour remonter.",
    ],
    benefits: [
      "Amplitude supérieure aux fentes classiques",
      "Activation intense des fessiers",
      "Développe l'équilibre et la stabilité de la hanche",
    ],
    commonMistakes: [
      "Se tenir trop près du banc, ce qui limite le mouvement",
      "Pencher le tronc trop en avant",
      "Le genou avant qui s'effondre vers l'intérieur",
    ],
    tips: [
      "Ajustez la distance au banc : environ 60-90 cm devant",
      "Concentrez-vous sur la descente lente et contrôlée",
    ],
    difficulty: "intermediate",
    equipment: ["Banc", "Haltères (optionnel)"],
    videoSearchQuery: "fentes bulgares split squat technique",
  },
  {
    name: "Leg extension",
    displayName: "Leg extension",
    description:
      "Exercice d'isolation sur machine ciblant uniquement les quadriceps. Le mouvement consiste à tendre les jambes contre une résistance.",
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: [],
    category: "strength",
    instructions: [
      "Asseyez-vous sur la machine, dos contre le dossier.",
      "Placez vos chevilles derrière le coussin inférieur.",
      "Tendez les jambes jusqu'à l'extension complète en contractant les quadriceps.",
      "Redescendez lentement en contrôlant la phase négative.",
    ],
    benefits: [
      "Isolation parfaite des quadriceps",
      "Idéal pour le travail de finition après les exercices composés",
      "Permet de travailler en unilatéral pour corriger les déséquilibres",
    ],
    commonMistakes: [
      "Utiliser l'élan pour soulever la charge",
      "Descendre trop vite sans contrôle",
      "Régler le dossier trop en avant ou en arrière",
    ],
    tips: [
      "Faites une pause en haut du mouvement pour maximiser la contraction",
      "Commencez léger et augmentez progressivement",
    ],
    difficulty: "beginner",
    equipment: ["Machine leg extension"],
    videoSearchQuery: "leg extension machine technique musculation",
  },
  {
    name: "Leg curl",
    displayName: "Leg curl",
    description:
      "Exercice d'isolation sur machine ciblant les ischio-jambiers. Consiste à fléchir les genoux contre une résistance.",
    primaryMuscles: ["Ischio-jambiers"],
    secondaryMuscles: ["Mollets"],
    category: "strength",
    instructions: [
      "Allongez-vous face contre la machine (ou asseyez-vous selon le type).",
      "Placez vos chevilles sous le coussin.",
      "Fléchissez les genoux pour amener vos talons vers vos fessiers.",
      "Redescendez lentement en contrôlant le mouvement.",
    ],
    benefits: [
      "Renforce les ischio-jambiers, souvent sous-développés",
      "Réduit le risque de blessures au genou",
      "Améliore l'équilibre musculaire de la cuisse",
    ],
    commonMistakes: [
      "Soulever les hanches du banc pendant le mouvement",
      "Utiliser une charge trop lourde avec mauvaise technique",
      "Ne pas aller en amplitude complète",
    ],
    tips: [
      "Pointez les orteils vers vous pour mieux activer les ischio-jambiers",
      "Essayez la version unilatérale pour un travail équilibré",
    ],
    difficulty: "beginner",
    equipment: ["Machine leg curl"],
    videoSearchQuery: "leg curl machine ischio-jambiers technique",
  },
  {
    name: "Hip thrust",
    displayName: "Hip thrust",
    description:
      "Exercice majeur pour les fessiers où l'on pousse les hanches vers le haut avec le dos appuyé sur un banc et une barre sur le bassin.",
    primaryMuscles: ["Fessiers"],
    secondaryMuscles: ["Ischio-jambiers", "Abdominaux"],
    category: "strength",
    instructions: [
      "Appuyez le haut de votre dos contre un banc, pieds au sol à la largeur des hanches.",
      "Placez une barre (avec protection) sur le pli de vos hanches.",
      "Poussez vos hanches vers le haut en serrant les fessiers au maximum.",
      "Redescendez lentement sans toucher le sol.",
    ],
    benefits: [
      "Activation maximale des fessiers — supérieure au squat",
      "Développe la puissance de la chaîne postérieure",
      "Améliore les performances sportives (sprint, saut)",
    ],
    commonMistakes: [
      "Cambrer excessivement le bas du dos en haut du mouvement",
      "Pieds trop proches ou trop loin du corps",
      "Ne pas serrer les fessiers au sommet du mouvement",
    ],
    tips: [
      "Regardez devant vous (menton rentré) pour aligner la colonne",
      "Utilisez un pad ou une serviette pour protéger vos hanches de la barre",
    ],
    difficulty: "intermediate",
    equipment: ["Banc", "Barre", "Pad de protection"],
    videoSearchQuery: "hip thrust barre fessiers technique",
  },
  {
    name: "Mollets debout",
    displayName: "Mollets debout",
    description:
      "Exercice d'isolation pour les mollets réalisé debout, en montant sur la pointe des pieds contre une résistance.",
    primaryMuscles: ["Mollets (gastrocnémiens)"],
    secondaryMuscles: ["Soléaire"],
    category: "strength",
    instructions: [
      "Placez-vous sur la machine à mollets ou sur une marche avec la barre sur les épaules.",
      "Descendez les talons en dessous du niveau de la marche pour étirer les mollets.",
      "Montez sur la pointe des pieds le plus haut possible.",
      "Maintenez la contraction en haut 1-2 secondes, puis redescendez lentement.",
    ],
    benefits: [
      "Développe la masse et la force des mollets",
      "Améliore la stabilité de la cheville",
      "Réduit le risque de blessures au tendon d'Achille",
    ],
    commonMistakes: [
      "Amplitude trop courte — allez au maximum en haut et en bas",
      "Rebondir en bas du mouvement au lieu de contrôler",
      "Fléchir les genoux au lieu de garder les jambes quasi tendues",
    ],
    tips: [
      "Les mollets répondent bien aux séries longues (15-20 reps)",
      "Variez la position des pieds (neutre, pointes vers l'intérieur/extérieur)",
    ],
    difficulty: "beginner",
    equipment: ["Machine à mollets", "Marche (step)"],
    videoSearchQuery: "mollets debout calf raise technique",
  },
  // ─── POITRINE ───
  {
    name: "Développé couché",
    displayName: "Développé couché",
    description:
      "Exercice fondamental pour la poitrine, réalisé allongé sur un banc plat. Consiste à pousser une barre verticalement. C'est l'un des trois mouvements de force athlétique.",
    primaryMuscles: ["Pectoraux"],
    secondaryMuscles: ["Triceps", "Deltoïdes antérieurs"],
    category: "strength",
    instructions: [
      "Allongez-vous sur le banc, pieds au sol, fessiers et épaules plaqués.",
      "Saisissez la barre un peu plus large que la largeur des épaules.",
      "Décrochez la barre et descendez-la en contrôle jusqu'à la poitrine.",
      "Poussez la barre vers le haut en expirant, bras tendus sans verrouiller les coudes.",
    ],
    benefits: [
      "Développe la force et le volume des pectoraux",
      "Renforce les triceps et les deltoïdes antérieurs",
      "Exercice de base mesurable pour suivre la progression de force",
    ],
    commonMistakes: [
      "Cambrer excessivement le dos — gardez les fessiers sur le banc",
      "Faire rebondir la barre sur la poitrine",
      "Prise trop large qui surcharge les épaules",
    ],
    tips: [
      "Serrez les omoplates pour stabiliser les épaules",
      "Utilisez toujours un pareur pour les charges lourdes",
      "Descendez la barre au niveau des mamelons",
    ],
    difficulty: "intermediate",
    equipment: ["Banc plat", "Barre", "Rack"],
    videoSearchQuery: "développé couché bench press technique",
  },
  {
    name: "Développé incliné haltères",
    displayName: "Développé incliné haltères",
    description:
      "Variante du développé couché sur banc incliné (30-45°) avec des haltères. Cible davantage la partie haute des pectoraux.",
    primaryMuscles: ["Pectoraux supérieurs"],
    secondaryMuscles: ["Triceps", "Deltoïdes antérieurs"],
    category: "strength",
    instructions: [
      "Réglez le banc à 30-45° d'inclinaison.",
      "Saisissez un haltère dans chaque main, allongez-vous sur le banc.",
      "Poussez les haltères vers le haut en rapprochant légèrement les mains.",
      "Descendez en contrôle jusqu'à sentir un bon étirement des pectoraux.",
    ],
    benefits: [
      "Développe la partie haute des pectoraux, souvent en retard",
      "Amplitude de mouvement supérieure à la barre",
      "Travail unilatéral qui corrige les déséquilibres",
    ],
    commonMistakes: [
      "Inclinaison trop forte (>45°) qui transfère le travail aux épaules",
      "Haltères qui se touchent en haut — gardez une légère séparation",
      "Descendre trop vite sans contrôle",
    ],
    tips: [
      "30° d'inclinaison est souvent optimal pour cibler le haut des pectoraux",
      "Tournez légèrement les poignets en haut pour maximiser la contraction",
    ],
    difficulty: "intermediate",
    equipment: ["Banc inclinable", "Haltères"],
    videoSearchQuery: "développé incliné haltères technique pectoraux",
  },
  {
    name: "Développé incliné barre",
    displayName: "Développé incliné barre",
    description:
      "Variante du développé couché sur banc incliné avec une barre. Permet de charger plus lourd que les haltères pour le travail du haut des pectoraux.",
    primaryMuscles: ["Pectoraux supérieurs"],
    secondaryMuscles: ["Triceps", "Deltoïdes antérieurs"],
    category: "strength",
    instructions: [
      "Réglez le banc à 30-45° sous un rack.",
      "Saisissez la barre un peu plus large que les épaules.",
      "Décrochez la barre et descendez-la vers le haut de la poitrine.",
      "Poussez vers le haut en expirant.",
    ],
    benefits: [
      "Permet de charger plus lourd qu'avec les haltères",
      "Excellent pour développer la force du haut des pectoraux",
      "Mouvement guidé qui convient aux débutants",
    ],
    commonMistakes: [
      "Descendre la barre trop bas (vers le ventre) au lieu du haut de la poitrine",
      "Décoller les fesses du banc pour pousser plus lourd",
      "Prise trop serrée qui surcharge les triceps",
    ],
    tips: [
      "Prenez une prise légèrement plus étroite que le développé couché plat",
      "Gardez les coudes à environ 45° du corps",
    ],
    difficulty: "intermediate",
    equipment: ["Banc inclinable", "Barre", "Rack"],
    videoSearchQuery: "développé incliné barre technique",
  },
  {
    name: "Dips",
    displayName: "Dips",
    description:
      "Exercice au poids de corps réalisé sur des barres parallèles. Travaille simultanément les pectoraux, triceps et épaules selon l'inclinaison du buste.",
    primaryMuscles: ["Pectoraux", "Triceps"],
    secondaryMuscles: ["Deltoïdes antérieurs"],
    category: "strength",
    instructions: [
      "Saisissez les barres parallèles, bras tendus, corps en suspension.",
      "Penchez légèrement le buste en avant (pour cibler les pectoraux).",
      "Descendez en fléchissant les coudes jusqu'à 90° ou légèrement en dessous.",
      "Poussez pour remonter en contractant pectoraux et triceps.",
    ],
    benefits: [
      "Exercice polyarticulaire au poids de corps — aucune machine nécessaire",
      "Développe la force fonctionnelle de poussée",
      "Travaille pectoraux et triceps simultanément",
    ],
    commonMistakes: [
      "Descendre trop bas, ce qui surcharge les épaules",
      "Garder le buste trop droit (trop de triceps, moins de pectoraux)",
      "Épaules qui remontent vers les oreilles",
    ],
    tips: [
      "Buste penché en avant = plus de pectoraux, buste droit = plus de triceps",
      "Ajoutez du lest (ceinture) quand le poids de corps devient trop facile",
    ],
    difficulty: "intermediate",
    equipment: ["Barres parallèles"],
    videoSearchQuery: "dips barres parallèles technique musculation",
  },
  {
    name: "Écarté poulie",
    displayName: "Écarté poulie",
    description:
      "Exercice d'isolation pour les pectoraux utilisant une poulie vis-à-vis. Le mouvement reproduit un geste d'ouverture et fermeture des bras.",
    primaryMuscles: ["Pectoraux"],
    secondaryMuscles: ["Deltoïdes antérieurs"],
    category: "strength",
    instructions: [
      "Placez-vous au centre de la poulie vis-à-vis, une poignée dans chaque main.",
      "Faites un pas en avant, bras écartés, coudes légèrement fléchis.",
      "Ramenez les mains devant vous en arc de cercle, comme pour enlacer un arbre.",
      "Revenez lentement à la position de départ en sentant l'étirement.",
    ],
    benefits: [
      "Isolation parfaite des pectoraux avec tension constante",
      "Excellent pour le travail de finition et la congestion musculaire",
      "Moins de stress sur les épaules que les écartés avec haltères",
    ],
    commonMistakes: [
      "Trop fléchir les coudes, transformant l'exercice en développé",
      "Utiliser l'élan du corps pour tirer la charge",
      "Ne pas contrôler la phase d'étirement (retour)",
    ],
    tips: [
      "Variez la hauteur des poulies pour cibler différentes portions des pectoraux",
      "Concentrez-vous sur la contraction maximale quand les mains se rejoignent",
    ],
    difficulty: "beginner",
    equipment: ["Poulie vis-à-vis"],
    videoSearchQuery: "écarté poulie pectoraux cable fly technique",
  },
  // ─── DOS ───
  {
    name: "Soulevé de terre",
    displayName: "Soulevé de terre",
    description:
      "Exercice fondamental de force où l'on soulève une barre posée au sol jusqu'à la position debout. Sollicite l'ensemble de la chaîne postérieure et le corps entier.",
    primaryMuscles: ["Dos (érecteurs du rachis)", "Fessiers", "Ischio-jambiers"],
    secondaryMuscles: ["Quadriceps", "Trapèzes", "Avant-bras", "Abdominaux"],
    category: "strength",
    instructions: [
      "Pieds à la largeur des hanches, barre au-dessus du milieu du pied.",
      "Fléchissez les hanches et les genoux, saisissez la barre (prise pronation ou mixte).",
      "Dos droit, poitrine haute, tirez la barre en poussant dans vos pieds.",
      "Verrouillez en position debout (hanches et genoux tendus), puis redescendez en contrôle.",
    ],
    benefits: [
      "Développe la force globale du corps comme aucun autre exercice",
      "Renforce toute la chaîne postérieure",
      "Améliore la posture et la densité osseuse",
      "Transfert direct vers les activités quotidiennes (soulever des objets)",
    ],
    commonMistakes: [
      "Dos arrondi — la cause n°1 de blessure. Gardez le dos NEUTRE",
      "Tirer avec les bras au lieu de pousser dans le sol avec les jambes",
      "Barre trop éloignée du corps pendant la montée",
    ],
    tips: [
      "La barre doit rester collée à vos tibias et cuisses pendant tout le mouvement",
      "Utilisez du magnésium pour améliorer la prise",
      "Ne regardez pas en haut — gardez le regard neutre",
    ],
    difficulty: "advanced",
    equipment: ["Barre", "Disques"],
    videoSearchQuery: "soulevé de terre deadlift technique",
  },
  {
    name: "Soulevé de terre roumain",
    displayName: "Soulevé de terre roumain",
    description:
      "Variante du soulevé de terre avec les jambes quasi tendues, ciblant principalement les ischio-jambiers et les fessiers. Le mouvement part de la position debout.",
    primaryMuscles: ["Ischio-jambiers", "Fessiers"],
    secondaryMuscles: ["Dos (érecteurs du rachis)", "Abdominaux"],
    category: "strength",
    instructions: [
      "Debout, barre en mains (prise pronation), pieds à la largeur des hanches.",
      "Poussez les hanches vers l'arrière en gardant les jambes quasi tendues (léger fléchi aux genoux).",
      "Descendez la barre le long des cuisses jusqu'à sentir un fort étirement des ischio-jambiers.",
      "Remontez en serrant les fessiers, sans cambrer le dos.",
    ],
    benefits: [
      "Étirement et renforcement des ischio-jambiers",
      "Développe la chaîne postérieure sans la charge du soulevé de terre classique",
      "Améliore la flexibilité de la hanche",
    ],
    commonMistakes: [
      "Arrondir le dos en descendant",
      "Plier trop les genoux, transformant l'exercice en squat",
      "Descendre trop bas au-delà de la souplesse disponible",
    ],
    tips: [
      "Imaginez que vous voulez toucher le mur derrière vous avec vos fesses",
      "Gardez la barre collée aux cuisses pendant tout le mouvement",
    ],
    difficulty: "intermediate",
    equipment: ["Barre", "Haltères (alternative)"],
    videoSearchQuery: "soulevé de terre roumain romanian deadlift technique",
  },
  {
    name: "Rowing barre",
    displayName: "Rowing barre",
    description:
      "Exercice de tirage horizontal avec une barre, penché en avant. Cible l'épaisseur du dos (grand dorsal, trapèzes, rhomboïdes).",
    primaryMuscles: ["Grand dorsal", "Trapèzes", "Rhomboïdes"],
    secondaryMuscles: ["Biceps", "Érecteurs du rachis", "Deltoïdes postérieurs"],
    category: "strength",
    instructions: [
      "Pieds à la largeur des hanches, genoux légèrement fléchis.",
      "Penchez le buste à environ 45° en gardant le dos droit.",
      "Tirez la barre vers le nombril en serrant les omoplates.",
      "Redescendez lentement en contrôlant le mouvement.",
    ],
    benefits: [
      "Développe l'épaisseur du dos",
      "Renforce la chaîne postérieure et améliore la posture",
      "Travaille les biceps en secondaire",
    ],
    commonMistakes: [
      "Se redresser pour utiliser l'élan — gardez le buste fixe",
      "Tirer avec les bras au lieu d'initier avec les coudes",
      "Dos arrondi sous la charge",
    ],
    tips: [
      "Pensez à amener vos coudes vers le plafond, pas vos mains",
      "Serrez les omoplates 1 seconde en haut du mouvement",
    ],
    difficulty: "intermediate",
    equipment: ["Barre"],
    videoSearchQuery: "rowing barre bent over row technique",
  },
  {
    name: "Rowing haltère",
    displayName: "Rowing haltère",
    description:
      "Exercice de tirage unilatéral avec un haltère, un genou et une main en appui sur un banc. Permet de travailler chaque côté du dos indépendamment.",
    primaryMuscles: ["Grand dorsal", "Trapèzes"],
    secondaryMuscles: ["Biceps", "Rhomboïdes", "Deltoïdes postérieurs"],
    category: "strength",
    instructions: [
      "Placez un genou et la main du même côté sur un banc.",
      "Saisissez l'haltère avec l'autre main, bras tendu.",
      "Tirez l'haltère vers la hanche en gardant le coude près du corps.",
      "Redescendez lentement en étirant le grand dorsal.",
    ],
    benefits: [
      "Corrige les déséquilibres entre les deux côtés du dos",
      "Grande amplitude de mouvement",
      "Position stable qui protège le bas du dos",
    ],
    commonMistakes: [
      "Tourner le torse pour monter la charge plus haut",
      "Tirer l'haltère trop loin du corps",
      "Ne pas étirer complètement le bras en bas du mouvement",
    ],
    tips: [
      "Tirez vers la hanche, pas vers l'épaule",
      "Gardez le dos parallèle au sol pendant tout le mouvement",
    ],
    difficulty: "beginner",
    equipment: ["Haltère", "Banc"],
    videoSearchQuery: "rowing haltère un bras one arm dumbbell row technique",
  },
  {
    name: "Tractions",
    displayName: "Tractions",
    description:
      "Exercice au poids de corps réalisé en se suspendant à une barre et en tirant le corps vers le haut. L'un des meilleurs exercices pour développer le dos en largeur.",
    primaryMuscles: ["Grand dorsal", "Grand rond"],
    secondaryMuscles: ["Biceps", "Trapèzes", "Rhomboïdes", "Avant-bras"],
    category: "strength",
    instructions: [
      "Suspendez-vous à la barre, prise légèrement plus large que les épaules (pronation).",
      "Engagez les omoplates vers le bas et l'arrière.",
      "Tirez votre corps vers le haut jusqu'à ce que le menton dépasse la barre.",
      "Redescendez lentement en contrôlant le mouvement.",
    ],
    benefits: [
      "Développe la largeur du dos (forme en V)",
      "Exercice fonctionnel au poids de corps",
      "Renforce la prise et les avant-bras",
      "Améliore la posture et la santé des épaules",
    ],
    commonMistakes: [
      "Se balancer pour utiliser l'élan (kipping)",
      "Ne pas descendre complètement les bras entre chaque répétition",
      "Hausser les épaules vers les oreilles au lieu de les tirer vers le bas",
    ],
    tips: [
      "Si vous ne pouvez pas faire de tractions, utilisez des bandes élastiques",
      "Prise supination (paumes vers vous) = plus de biceps",
      "Ajoutez du lest quand vous dépassez 12 répétitions",
    ],
    difficulty: "intermediate",
    equipment: ["Barre de traction"],
    videoSearchQuery: "tractions pull ups technique musculation",
  },
  {
    name: "Tirage vertical",
    displayName: "Tirage vertical",
    description:
      "Exercice sur machine reproduisant le mouvement de traction, en tirant une barre de poulie haute vers la poitrine. Idéal pour ceux qui ne maîtrisent pas encore les tractions.",
    primaryMuscles: ["Grand dorsal", "Grand rond"],
    secondaryMuscles: ["Biceps", "Trapèzes", "Rhomboïdes"],
    category: "strength",
    instructions: [
      "Asseyez-vous face à la machine, genoux calés sous les boudins.",
      "Saisissez la barre large en pronation.",
      "Tirez la barre vers le haut de la poitrine en serrant les omoplates.",
      "Remontez lentement en contrôlant la charge.",
    ],
    benefits: [
      "Alternative accessible aux tractions pour les débutants",
      "Permet d'ajuster la charge précisément",
      "Développe la largeur du dos",
    ],
    commonMistakes: [
      "Tirer derrière la nuque — toujours tirer devant",
      "Se pencher trop en arrière pour utiliser l'élan",
      "Prise trop large qui limite l'amplitude",
    ],
    tips: [
      "Pensez à tirer avec les coudes, pas avec les mains",
      "Variez les prises : large, serrée, neutre pour cibler différemment",
    ],
    difficulty: "beginner",
    equipment: ["Machine à poulie haute"],
    videoSearchQuery: "tirage vertical lat pulldown technique",
  },
  {
    name: "Tirage face",
    displayName: "Tirage face",
    description:
      "Exercice à la poulie haute tirant vers le visage. Cible les deltoïdes postérieurs et les muscles de la coiffe des rotateurs. Excellent pour la santé des épaules.",
    primaryMuscles: ["Deltoïdes postérieurs", "Trapèzes moyens"],
    secondaryMuscles: ["Rhomboïdes", "Coiffe des rotateurs"],
    category: "strength",
    instructions: [
      "Réglez la poulie à hauteur du visage avec une corde.",
      "Reculez de quelques pas, bras tendus devant vous.",
      "Tirez la corde vers votre visage en écartant les mains.",
      "Serrez les omoplates en fin de mouvement, coudes hauts.",
    ],
    benefits: [
      "Prévient les blessures aux épaules",
      "Corrige le déséquilibre entre muscles de poussée et de tirage",
      "Améliore la posture en renforçant le haut du dos",
    ],
    commonMistakes: [
      "Utiliser trop de poids, ce qui empêche le bon mouvement",
      "Ne pas écarter les mains suffisamment à la fin",
      "Se pencher en arrière au lieu de rester droit",
    ],
    tips: [
      "Faites cet exercice à chaque séance de poussée pour équilibrer les épaules",
      "Gardez le mouvement lent et contrôlé — pas d'élan",
    ],
    difficulty: "beginner",
    equipment: ["Poulie haute", "Corde"],
    videoSearchQuery: "face pull poulie technique épaules",
  },
  {
    name: "Shrugs",
    displayName: "Shrugs",
    description:
      "Exercice d'isolation pour les trapèzes supérieurs. Consiste à hausser les épaules contre une résistance (haltères ou barre).",
    primaryMuscles: ["Trapèzes supérieurs"],
    secondaryMuscles: ["Trapèzes moyens", "Élévateur de la scapula"],
    category: "strength",
    instructions: [
      "Debout, haltères ou barre en mains, bras le long du corps.",
      "Haussez les épaules le plus haut possible vers vos oreilles.",
      "Maintenez la contraction 1-2 secondes en haut.",
      "Redescendez lentement les épaules.",
    ],
    benefits: [
      "Développe les trapèzes pour un cou et un haut du dos plus imposants",
      "Renforce la stabilité cervicale",
      "Exercice simple et efficace",
    ],
    commonMistakes: [
      "Faire des rotations d'épaules — montez et descendez en ligne droite",
      "Utiliser les bras (fléchir les coudes) au lieu de hausser les épaules",
      "Amplitude trop courte",
    ],
    tips: [
      "Les haltères permettent une plus grande amplitude que la barre",
      "Les trapèzes répondent bien aux charges lourdes et aux séries moyennes",
    ],
    difficulty: "beginner",
    equipment: ["Haltères", "Barre (alternative)"],
    videoSearchQuery: "shrugs trapèzes technique musculation",
  },
  // ─── ÉPAULES ───
  {
    name: "Développé militaire",
    displayName: "Développé militaire",
    description:
      "Exercice fondamental pour les épaules, réalisé debout ou assis, en poussant une barre ou des haltères au-dessus de la tête.",
    primaryMuscles: ["Deltoïdes (antérieurs et latéraux)"],
    secondaryMuscles: ["Triceps", "Trapèzes", "Abdominaux"],
    category: "strength",
    instructions: [
      "Debout ou assis, saisissez la barre devant vous, mains un peu plus larges que les épaules.",
      "La barre part au niveau des clavicules.",
      "Poussez la barre au-dessus de la tête jusqu'à extension complète des bras.",
      "Redescendez lentement jusqu'aux clavicules.",
    ],
    benefits: [
      "Développe les épaules en force et en volume",
      "Renforce le tronc et la stabilité debout",
      "Améliore la force de poussée au-dessus de la tête",
    ],
    commonMistakes: [
      "Cambrer excessivement le dos — contractez les abdos et les fessiers",
      "Pousser la barre en avant au lieu de verticalement",
      "Ne pas passer la tête sous la barre en haut du mouvement",
    ],
    tips: [
      "Debout recrute plus de stabilisateurs qu'assis",
      "Utilisez une ceinture de force pour les charges lourdes",
    ],
    difficulty: "intermediate",
    equipment: ["Barre", "Rack"],
    videoSearchQuery: "développé militaire overhead press technique",
  },
  {
    name: "Élévations latérales",
    displayName: "Élévations latérales",
    description:
      "Exercice d'isolation pour les deltoïdes latéraux. Consiste à lever les bras sur les côtés avec des haltères. Donne la largeur aux épaules.",
    primaryMuscles: ["Deltoïdes latéraux"],
    secondaryMuscles: ["Trapèzes supérieurs"],
    category: "strength",
    instructions: [
      "Debout, un haltère dans chaque main, bras le long du corps.",
      "Levez les bras sur les côtés jusqu'à la hauteur des épaules, coudes légèrement fléchis.",
      "Maintenez 1 seconde en haut du mouvement.",
      "Redescendez lentement en contrôlant la charge.",
    ],
    benefits: [
      "Développe la largeur des épaules (silhouette en V)",
      "Isolation efficace des deltoïdes latéraux",
      "Peut être réalisé avec des charges légères pour un bon résultat",
    ],
    commonMistakes: [
      "Utiliser trop de poids et compenser avec le corps (balancement)",
      "Lever les bras au-dessus des épaules, ce qui surcharge les trapèzes",
      "Bras trop tendus — gardez un léger fléchi aux coudes",
    ],
    tips: [
      "Pensez à verser de l'eau d'une bouteille en haut du mouvement (petit doigt légèrement plus haut)",
      "Utilisez des charges légères avec beaucoup de répétitions (15-20)",
    ],
    difficulty: "beginner",
    equipment: ["Haltères"],
    videoSearchQuery: "élévations latérales haltères technique épaules",
  },
  // ─── BRAS ───
  {
    name: "Curl biceps",
    displayName: "Curl biceps",
    description:
      "Exercice d'isolation classique pour les biceps. Consiste à fléchir les coudes pour monter des haltères vers les épaules.",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Avant-bras (brachio-radial)"],
    category: "strength",
    instructions: [
      "Debout, un haltère dans chaque main, bras le long du corps, paumes vers l'avant.",
      "Fléchissez les coudes pour monter les haltères vers les épaules.",
      "Serrez les biceps en haut du mouvement.",
      "Redescendez lentement en contrôlant la phase négative.",
    ],
    benefits: [
      "Isolation directe des biceps",
      "Améliore l'esthétique des bras",
      "Renforce la prise et les avant-bras en secondaire",
    ],
    commonMistakes: [
      "Balancer le corps pour monter la charge — gardez les coudes fixes",
      "Monter les coudes vers l'avant au lieu de les garder le long du corps",
      "Amplitude incomplète — descendez jusqu'en bas à chaque répétition",
    ],
    tips: [
      "Faites des curls alternés pour vous concentrer sur chaque bras",
      "La phase négative (descente) est aussi importante que la montée — allez lentement",
    ],
    difficulty: "beginner",
    equipment: ["Haltères"],
    videoSearchQuery: "curl biceps haltères technique musculation",
  },
  {
    name: "Curl biceps barre",
    displayName: "Curl biceps barre",
    description:
      "Variante du curl avec une barre droite ou EZ. Permet de charger plus lourd et de travailler les deux bras simultanément.",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Avant-bras (brachio-radial)"],
    category: "strength",
    instructions: [
      "Debout, saisissez la barre en supination (paumes vers le haut), mains à la largeur des épaules.",
      "Coudes collés au corps, fléchissez les bras pour monter la barre.",
      "Contractez les biceps en haut du mouvement.",
      "Redescendez lentement sans balancer le corps.",
    ],
    benefits: [
      "Permet de soulever plus lourd qu'avec les haltères",
      "Travail symétrique des deux biceps",
      "La barre EZ réduit le stress sur les poignets",
    ],
    commonMistakes: [
      "Utiliser l'élan du corps (cheat curl) — gardez le corps immobile",
      "Incliner les poignets en arrière",
      "Ne pas aller en extension complète en bas",
    ],
    tips: [
      "La barre EZ est plus confortable pour les poignets que la barre droite",
      "Essayez les tempo curls (3 secondes à la descente) pour plus d'intensité",
    ],
    difficulty: "beginner",
    equipment: ["Barre droite ou EZ"],
    videoSearchQuery: "curl biceps barre EZ technique",
  },
  {
    name: "Curl marteau",
    displayName: "Curl marteau",
    description:
      "Variante du curl avec les paumes face à face (prise neutre). Cible davantage le brachio-radial et le long supinateur, donnant de l'épaisseur aux bras.",
    primaryMuscles: ["Biceps", "Brachio-radial"],
    secondaryMuscles: ["Avant-bras"],
    category: "strength",
    instructions: [
      "Debout, un haltère dans chaque main, paumes face à face (prise neutre).",
      "Fléchissez les coudes pour monter les haltères, en gardant la prise neutre.",
      "Contractez en haut du mouvement.",
      "Redescendez lentement.",
    ],
    benefits: [
      "Développe l'épaisseur des bras (brachio-radial)",
      "Renforce les avant-bras et la prise",
      "Position de poignet plus naturelle et confortable",
    ],
    commonMistakes: [
      "Tourner les poignets pendant le mouvement — gardez la prise neutre",
      "Balancer le corps pour soulever plus lourd",
      "Croiser les haltères devant le corps",
    ],
    tips: [
      "Excellent en supersérie avec les curls classiques",
      "Faites-les alternés pour plus de concentration",
    ],
    difficulty: "beginner",
    equipment: ["Haltères"],
    videoSearchQuery: "curl marteau hammer curl technique",
  },
  {
    name: "Curl incliné",
    displayName: "Curl incliné",
    description:
      "Curl biceps réalisé sur un banc incliné (45°), ce qui étire davantage le biceps en position basse. Excellent pour le développement de la longue portion.",
    primaryMuscles: ["Biceps (longue portion)"],
    secondaryMuscles: ["Avant-bras"],
    category: "strength",
    instructions: [
      "Asseyez-vous sur un banc incliné à 45°, un haltère dans chaque main, bras pendants.",
      "Fléchissez les coudes pour monter les haltères vers les épaules.",
      "Contractez les biceps en haut.",
      "Redescendez lentement en sentant l'étirement.",
    ],
    benefits: [
      "Étirement maximal du biceps en position basse",
      "Cible la longue portion du biceps (pic du biceps)",
      "Empêche de tricher car le dos est calé contre le banc",
    ],
    commonMistakes: [
      "Banc trop incliné (trop plat) — 45° est optimal",
      "Avancer les coudes pendant le mouvement",
      "Ne pas descendre les bras complètement entre les reps",
    ],
    tips: [
      "Utilisez des charges plus légères que le curl debout — l'étirement rend l'exercice plus difficile",
      "Tournez les paumes vers le haut pendant la montée (supination) pour plus de contraction",
    ],
    difficulty: "intermediate",
    equipment: ["Banc inclinable", "Haltères"],
    videoSearchQuery: "curl incliné banc biceps technique",
  },
  {
    name: "Extensions triceps",
    displayName: "Extensions triceps",
    description:
      "Exercice d'isolation pour les triceps. Peut être réalisé au-dessus de la tête avec un haltère ou une barre, ciblant la longue portion du triceps.",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    category: "strength",
    instructions: [
      "Assis ou debout, tenez un haltère à deux mains au-dessus de la tête.",
      "Fléchissez les coudes pour descendre l'haltère derrière la tête.",
      "Gardez les coudes pointés vers le plafond et proches de la tête.",
      "Tendez les bras pour remonter la charge, en contractant les triceps.",
    ],
    benefits: [
      "Étirement complet de la longue portion du triceps",
      "Développe la masse globale des triceps",
      "Peut être réalisé avec divers équipements",
    ],
    commonMistakes: [
      "Écarter les coudes — gardez-les pointés vers le plafond",
      "Utiliser trop de poids, ce qui oblige à cambrer le dos",
      "Amplitude incomplète",
    ],
    tips: [
      "Utilisez un haltère tenu en diamant pour plus de stabilité",
      "Faites l'exercice assis si vous avez tendance à cambrer le dos",
    ],
    difficulty: "beginner",
    equipment: ["Haltère", "Barre EZ (alternative)"],
    videoSearchQuery: "extensions triceps au dessus de la tête technique",
  },
  {
    name: "Extensions triceps poulie",
    displayName: "Extensions triceps poulie",
    description:
      "Exercice d'isolation pour les triceps à la poulie haute. Le mouvement consiste à tendre les bras vers le bas contre la résistance du câble.",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    category: "strength",
    instructions: [
      "Face à la poulie haute, saisissez la barre ou la corde.",
      "Coudes collés au corps, poussez vers le bas jusqu'à extension complète.",
      "Contractez les triceps en bas du mouvement.",
      "Remontez lentement en contrôlant la charge.",
    ],
    benefits: [
      "Tension constante grâce au câble",
      "Isolation efficace sans stress sur les épaules",
      "Facile à ajuster la charge pour les drop sets",
    ],
    commonMistakes: [
      "Écarter les coudes du corps pendant le mouvement",
      "Se pencher en avant pour utiliser le poids du corps",
      "Ne pas aller en extension complète des bras",
    ],
    tips: [
      "La corde permet d'écarter les mains en bas pour plus de contraction",
      "Gardez les coudes strictement immobiles — seuls les avant-bras bougent",
    ],
    difficulty: "beginner",
    equipment: ["Poulie haute", "Barre droite ou corde"],
    videoSearchQuery: "extensions triceps poulie pushdown technique",
  },
  // ─── ABDOMINAUX ───
  {
    name: "Crunch",
    displayName: "Crunch",
    description:
      "Exercice de base pour les abdominaux. Consiste à enrouler le haut du tronc en décollant les épaules du sol, ciblant la partie haute des abdominaux.",
    primaryMuscles: ["Grand droit de l'abdomen"],
    secondaryMuscles: ["Obliques"],
    category: "strength",
    instructions: [
      "Allongez-vous sur le dos, genoux fléchis, pieds au sol.",
      "Mains derrière la tête (sans tirer sur la nuque) ou croisées sur la poitrine.",
      "Enroulez le haut du tronc en décollant les épaules du sol, en expirant.",
      "Redescendez lentement sans reposer complètement la tête au sol.",
    ],
    benefits: [
      "Renforce le grand droit de l'abdomen",
      "Exercice accessible à tous les niveaux",
      "Aucun matériel nécessaire",
    ],
    commonMistakes: [
      "Tirer sur la nuque avec les mains — gardez un espace entre le menton et la poitrine",
      "Décoller tout le dos du sol (c'est un sit-up, pas un crunch)",
      "Bloquer la respiration au lieu d'expirer à la montée",
    ],
    tips: [
      "Concentrez-vous sur la contraction abdominale, pas sur la hauteur de montée",
      "Faites des séries longues (15-25 reps) pour les abdominaux",
    ],
    difficulty: "beginner",
    equipment: [],
    videoSearchQuery: "crunch abdominaux technique",
  },
  {
    name: "Planche",
    displayName: "Planche",
    description:
      "Exercice isométrique de gainage où l'on maintient le corps en ligne droite en appui sur les avant-bras et les pieds. Renforce l'ensemble de la ceinture abdominale.",
    primaryMuscles: ["Abdominaux (transverse)", "Grand droit de l'abdomen"],
    secondaryMuscles: ["Obliques", "Lombaires", "Épaules", "Fessiers"],
    category: "strength",
    instructions: [
      "En appui sur les avant-bras et les pointes de pieds.",
      "Gardez le corps parfaitement aligné : tête, épaules, hanches, pieds sur une même ligne.",
      "Contractez les abdominaux et les fessiers pour maintenir la position.",
      "Respirez normalement et maintenez la durée cible.",
    ],
    benefits: [
      "Renforce la stabilité du tronc dans sa globalité",
      "Aucun matériel nécessaire",
      "Améliore la posture et prévient les douleurs lombaires",
      "Peut être pratiqué n'importe où",
    ],
    commonMistakes: [
      "Hanches trop hautes (en pic) ou trop basses (dos creux)",
      "Retenir sa respiration au lieu de respirer normalement",
      "Regarder vers l'avant au lieu du sol (colonne cervicale neutre)",
    ],
    tips: [
      "Commencez par 20-30 secondes et augmentez progressivement",
      "Serrez les fessiers pour protéger le bas du dos",
    ],
    difficulty: "beginner",
    equipment: [],
    videoSearchQuery: "planche gainage plank technique",
  },
  // ─── CARDIO ───
  {
    name: "Burpees",
    displayName: "Burpees",
    description:
      "Exercice cardio complet combinant un squat, une planche, une pompe et un saut. L'un des exercices les plus exigeants pour le conditionnement physique.",
    primaryMuscles: ["Corps entier"],
    secondaryMuscles: ["Pectoraux", "Quadriceps", "Épaules", "Abdominaux"],
    category: "cardio",
    instructions: [
      "Debout, accroupissez-vous et posez les mains au sol.",
      "Lancez les pieds en arrière pour arriver en position de planche.",
      "Faites une pompe (optionnel), puis ramenez les pieds vers les mains.",
      "Sautez en l'air en levant les bras au-dessus de la tête.",
    ],
    benefits: [
      "Brûle un maximum de calories en un minimum de temps",
      "Travaille l'ensemble du corps",
      "Améliore l'endurance cardiovasculaire et la puissance",
      "Aucun matériel nécessaire",
    ],
    commonMistakes: [
      "Dos creusé en position planche — gardez les abdos engagés",
      "Ne pas aller en extension complète lors du saut",
      "Rythme trop rapide au détriment de la forme",
    ],
    tips: [
      "Modifiez l'exercice si nécessaire : sans pompe ou sans saut pour les débutants",
      "Utilisez en HIIT : 30 sec de burpees, 30 sec de repos",
    ],
    difficulty: "intermediate",
    equipment: [],
    videoSearchQuery: "burpees technique exercice cardio",
  },
  {
    name: "Mountain climbers",
    displayName: "Mountain climbers",
    description:
      "Exercice cardio dynamique en position de planche, simulant une course en montagne. Combine travail abdominal et cardio.",
    primaryMuscles: ["Abdominaux", "Fléchisseurs de la hanche"],
    secondaryMuscles: ["Épaules", "Quadriceps", "Fessiers"],
    category: "cardio",
    instructions: [
      "Placez-vous en position de pompe, bras tendus.",
      "Amenez rapidement un genou vers la poitrine.",
      "Ramenez la jambe et répétez avec l'autre jambe.",
      "Alternez rapidement en gardant les hanches basses.",
    ],
    benefits: [
      "Combine cardio et renforcement abdominal",
      "Améliore l'agilité et la coordination",
      "Brûle efficacement les calories",
      "Aucun matériel nécessaire",
    ],
    commonMistakes: [
      "Hanches trop hautes en l'air — gardez le corps en ligne",
      "Rebondir au lieu de contrôler chaque répétition",
      "Oublier de respirer régulièrement",
    ],
    tips: [
      "Commencez lentement pour maîtriser la forme, puis accélérez",
      "Pour plus d'intensité, amenez le genou vers le coude opposé (cross-body)",
    ],
    difficulty: "beginner",
    equipment: [],
    videoSearchQuery: "mountain climbers technique exercice",
  },
  {
    name: "Jumping jacks",
    displayName: "Jumping jacks",
    description:
      "Exercice cardio classique consistant à sauter en écartant les jambes et les bras simultanément. Parfait pour l'échauffement ou les circuits HIIT.",
    primaryMuscles: ["Corps entier (cardio)"],
    secondaryMuscles: ["Mollets", "Épaules", "Adducteurs"],
    category: "cardio",
    instructions: [
      "Debout, pieds joints, bras le long du corps.",
      "Sautez en écartant les jambes et en levant les bras au-dessus de la tête.",
      "Revenez en position initiale d'un nouveau saut.",
      "Répétez à un rythme soutenu.",
    ],
    benefits: [
      "Excellent échauffement complet",
      "Améliore l'endurance cardiovasculaire",
      "Aucun matériel, réalisable partout",
    ],
    commonMistakes: [
      "Atterrir sur les talons au lieu des plantes de pieds",
      "Ne pas monter les bras complètement au-dessus de la tête",
      "Rythme irrégulier",
    ],
    tips: [
      "Gardez un rythme constant plutôt que d'aller le plus vite possible",
      "Atterrissez en souplesse en fléchissant légèrement les genoux",
    ],
    difficulty: "beginner",
    equipment: [],
    videoSearchQuery: "jumping jacks technique exercice cardio",
  },
  {
    name: "Sprint",
    displayName: "Sprint",
    description:
      "Course à vitesse maximale sur une courte distance ou durée. L'un des exercices cardio les plus efficaces pour brûler les graisses et développer la puissance.",
    primaryMuscles: ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets"],
    secondaryMuscles: ["Abdominaux", "Fléchisseurs de la hanche"],
    category: "cardio",
    instructions: [
      "Échauffez-vous minutieusement (5-10 min de course légère + gammes).",
      "Positionnez-vous en départ de sprint, corps légèrement penché en avant.",
      "Sprintez à intensité maximale sur 20-100 mètres (ou 10-30 secondes).",
      "Récupérez en marchant ou au repos avant le prochain sprint.",
    ],
    benefits: [
      "Brûle les graisses très efficacement (effet afterburn)",
      "Développe la puissance et la vitesse",
      "Améliore le système cardiovasculaire en peu de temps",
      "Stimule la production d'hormones anabolisantes",
    ],
    commonMistakes: [
      "Ne pas s'échauffer suffisamment avant de sprinter",
      "Temps de repos trop court entre les sprints",
      "Sprinter sur des surfaces glissantes ou inégales",
    ],
    tips: [
      "Commencez par des sprints à 70-80% de votre vitesse maximale",
      "Ratio travail/repos de 1:3 ou 1:4 pour les débutants",
    ],
    difficulty: "intermediate",
    equipment: ["Piste ou terrain plat"],
    videoSearchQuery: "sprint intervalle HIIT technique",
  },
  {
    name: "Course à pied",
    displayName: "Course à pied",
    description:
      "Activité cardio fondamentale à intensité modérée et soutenue. Améliore l'endurance cardiovasculaire, brûle les calories et renforce les jambes.",
    primaryMuscles: ["Quadriceps", "Mollets", "Ischio-jambiers"],
    secondaryMuscles: ["Fessiers", "Abdominaux", "Fléchisseurs de la hanche"],
    category: "cardio",
    instructions: [
      "Commencez par un échauffement de 5 minutes de marche rapide.",
      "Courez à une allure où vous pouvez maintenir une conversation.",
      "Gardez le dos droit, les épaules relâchées, le regard devant.",
      "Terminez par 5 minutes de marche pour le retour au calme.",
    ],
    benefits: [
      "Améliore l'endurance cardiovasculaire",
      "Brûle efficacement les calories et les graisses",
      "Réduit le stress et améliore l'humeur (endorphines)",
      "Aucun matériel spécifique nécessaire",
    ],
    commonMistakes: [
      "Partir trop vite — commencez à une allure confortable",
      "Augmenter le volume trop rapidement (règle des 10%/semaine)",
      "Négliger l'échauffement et les étirements",
    ],
    tips: [
      "Investissez dans de bonnes chaussures adaptées à votre foulée",
      "Alternez course et marche si vous débutez (méthode 1min/1min)",
    ],
    difficulty: "beginner",
    equipment: ["Chaussures de course"],
    videoSearchQuery: "course à pied technique débutant running",
  },
  {
    name: "Vélo",
    displayName: "Vélo",
    description:
      "Activité cardio à faible impact articulaire, en salle (vélo stationnaire) ou en extérieur. Excellent pour l'endurance sans stress sur les articulations.",
    primaryMuscles: ["Quadriceps", "Fessiers"],
    secondaryMuscles: ["Ischio-jambiers", "Mollets"],
    category: "cardio",
    instructions: [
      "Réglez la selle à la bonne hauteur (jambe quasi tendue en bas de pédalage).",
      "Commencez à pédaler à une résistance modérée.",
      "Maintenez une cadence régulière (60-90 RPM).",
      "Variez l'intensité selon votre objectif (endurance ou HIIT).",
    ],
    benefits: [
      "Cardio sans impact sur les articulations",
      "Développe les quadriceps et l'endurance",
      "Adapté à tous les niveaux et conditions physiques",
      "Peut être pratiqué en intérieur ou extérieur",
    ],
    commonMistakes: [
      "Selle trop basse, ce qui surcharge les genoux",
      "Résistance trop faible (pédaler dans le vide)",
      "Se pencher trop en avant avec un dos arrondi",
    ],
    tips: [
      "Pour brûler plus de graisses, alternez haute et basse intensité",
      "Gardez le haut du corps détendu, ne vous crispez pas",
    ],
    difficulty: "beginner",
    equipment: ["Vélo stationnaire ou vélo de route"],
    videoSearchQuery: "vélo stationnaire technique cardio",
  },
  {
    name: "Rameur",
    displayName: "Rameur",
    description:
      "Exercice cardio complet sur machine de rowing. Sollicite 86% des muscles du corps en combinant poussée des jambes et tirage du dos.",
    primaryMuscles: ["Grand dorsal", "Quadriceps", "Fessiers"],
    secondaryMuscles: ["Biceps", "Trapèzes", "Ischio-jambiers", "Abdominaux"],
    category: "cardio",
    instructions: [
      "Asseyez-vous sur le rameur, pieds sangles, genoux fléchis.",
      "Saisissez la poignée, bras tendus, dos droit.",
      "Poussez avec les jambes, puis tirez la poignée vers l'abdomen (dos bien droit).",
      "Revenez en position initiale en inversant le mouvement : bras, dos, jambes.",
    ],
    benefits: [
      "Cardio complet qui sollicite presque tout le corps",
      "Très faible impact articulaire",
      "Brûle énormément de calories",
      "Renforce le dos tout en faisant du cardio",
    ],
    commonMistakes: [
      "Tirer avec les bras en premier au lieu de pousser avec les jambes",
      "Dos arrondi pendant le tirage",
      "Rythme : les jambes doivent initier 60% de la force",
    ],
    tips: [
      "Séquence correcte : JAMBES → DOS → BRAS (tirage) puis BRAS → DOS → JAMBES (retour)",
      "Visez 20-30 coups/minute pour l'endurance",
    ],
    difficulty: "beginner",
    equipment: ["Rameur (ergomètre)"],
    videoSearchQuery: "rameur technique rowing machine ergomètre",
  },
];

// Index par nom normalisé pour lookup O(1)
const EXERCISE_INDEX = new Map<string, ExerciseInfo>();
for (const ex of EXERCISE_DATABASE) {
  EXERCISE_INDEX.set(normalize(ex.name), ex);
  // Ajouter aussi le displayName normalisé si différent
  const normalizedDisplay = normalize(ex.displayName);
  if (!EXERCISE_INDEX.has(normalizedDisplay)) {
    EXERCISE_INDEX.set(normalizedDisplay, ex);
  }
}

/**
 * Recherche les informations d'un exercice par son nom.
 * Gère les accents et la casse automatiquement.
 */
export function getExerciseInfo(exerciseName: string): ExerciseInfo | null {
  return EXERCISE_INDEX.get(normalize(exerciseName)) ?? null;
}

/**
 * Vérifie si un exercice a une fiche d'information disponible.
 */
export function hasExerciseInfo(exerciseName: string): boolean {
  return EXERCISE_INDEX.has(normalize(exerciseName));
}
