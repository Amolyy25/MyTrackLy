// Configuration de l'URL de l'API
// En développement : utilise http://localhost:3000/api
// En production : utilise VITE_API_URL depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default API_URL;

