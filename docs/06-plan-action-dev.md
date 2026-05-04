# 06. Plan d'Action de Développement (Step-by-Step)

Ce document sert de feuille de route pour l'implémentation technique sur la branche `alexis`.

## Phase 0 : Setup & Outillage (TERMINÉ ✅)
- Installation de Tailwind CSS, shadcn-svelte, Drizzle ORM, SQLite et Lucia Auth.
- Configuration des fichiers racines (`tailwind.config.ts`, `components.json`, `postcss.config.js`).

## Phase 1 : Base de Données & Auth (TERMINÉ ✅)
- Création du schéma Drizzle (`src/lib/server/db/schema.ts`) incluant les demi-journées.
- Configuration de la connexion DB et de Lucia Auth.
- Mise en place du middleware SvelteKit (`hooks.server.ts`).
- Génération de la première migration SQL.

## Phase 2 : UI Core & Authentification (À FAIRE 🕒)
- Génération des composants shadcn (Button, Input, Card, etc.).
- Création de la page de connexion (`/login`).
- Mise en place du layout global (`src/routes/+layout.svelte`) avec navigation.

## Phase 3 : Coeur Fonctionnel - Le Timesheet (À FAIRE 🕒)
- Développement de la page `/saisie`.
- Vue "Semaine" par défaut.
- Implémentation de la modale Pop-up pour l'ajout de tâches.
- Logique de calcul des heures en temps réel (Runes Svelte 5).

## Phase 4 : Automatisations (À FAIRE 🕒)
- Création des endpoints API `/api/cron/*`.
- Sécurisation par Token.
- Logique d'envoi d'emails via Resend.

## Phase 5 : Finalisation (À FAIRE 🕒)
- Tests manuels des flux critiques.
- Nettoyage du code et documentation finale.
