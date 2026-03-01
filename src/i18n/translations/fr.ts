export default {
	// Common
	common: {
		cancel: 'Annuler',
		confirm: 'Confirmer',
		save: 'Enregistrer',
		delete: 'Supprimer',
		edit: 'Modifier',
		close: 'Fermer',
		back: 'Retour',
		next: 'Suivant',
		loading: 'Chargement...',
		error: 'Erreur',
		success: 'Succès',
	},

	// Auth
	auth: {
		login: 'Connexion',
		logout: 'Déconnexion',
		loggingOut: 'Déconnexion...',
		register: 'Inscription',
		email: 'Email',
		password: 'Mot de passe',
		username: "Nom d'utilisateur",
		forgotPassword: 'Mot de passe oublié ?',
		resetPassword: 'Réinitialiser le mot de passe',
		sendingResetEmail: 'Envoi...',
		resetEmailSent: 'Email envoyé ({{seconds}}s)',
		resendResetEmail: "Renvoyer l'email",
	},

	// Profile
	profile: {
		title: 'Profil',
		settings: 'Paramètres',
		language: 'Langue',
		selectLanguage: 'Sélectionner la langue',
	},

	// Home
	home: {
		title: 'Accueil',
		welcome: 'Bienvenue',
	},

	// Journey
	journey: {
		title: 'Trajet',
		start: 'Démarrer',
		stop: 'Arrêter',
		pause: 'Pause',
		resume: 'Reprendre',
		current: 'Trajet en cours',
		history: 'Historique',
		distance: 'Distance',
		duration: 'Durée',
		spots: 'Points',
	},

	// Spots
	spots: {
		title: 'Points',
		add: 'Ajouter un point',
		edit: 'Modifier le point',
		delete: 'Supprimer le point',
		details: 'Détails du point',
		name: 'Nom',
		description: 'Description',
		location: 'Localisation',
		coordinates: 'Coordonnées',
	},

	// Map
	map: {
		title: 'Carte',
		search: 'Rechercher',
		currentLocation: 'Position actuelle',
		center: 'Centrer',
	},

	// Languages
	languages: {
		fr: 'Français',
	},
} as const;
