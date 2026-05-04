# 08. Interface d'Administration & Exports

Ce document détaille les fonctionnalités accessibles uniquement aux utilisateurs de niveau `Manager (2)` et `Direction (3)`. L'objectif est de leur offrir des outils simples, performants et actionnables.

## 1. Tableau de Bord d'Administration (`/admin`)
*Accessible uniquement si `user.level === 3` (Direction).*

### A. Gestion des Utilisateurs (CRUD)
Utilisation d'un composant `DataTable` (shadcn-svelte) offrant :
*   **Colonnes** : Nom complet, Email, Niveau (Employé/Manager/Direction), Pôle, Groupe, Statut (Actif/Inactif).
*   **Filtres** : Recherche par nom, filtre par niveau.
*   **Actions** :
    *   Modifier le profil (Changement de niveau ou de groupe).
    *   Désactiver un compte (Soft-delete via `is_active=0`). *Règle : on ne supprime jamais un utilisateur pour ne pas casser l'historique des timesheets.*
    *   Bouton "Reset Password" (envoi d'un email de réinitialisation).

### B. Gestion des Listes Déroulantes (Paramètres)
Interface permettant d'administrer les éléments (Clients, Projets, Tâches) générés dynamiquement par les utilisateurs.
*   **Action "Fusionner"** : Très utile si des employés ont créé des doublons (ex: "Projet A", "Projet-A"). Le système doit permettre de fusionner deux paramètres et de réaffecter l'historique associé.
*   **Désactivation** : Un projet terminé peut être passé en `is_active=false`. Il disparaîtra des choix de saisie, mais restera visible dans l'historique.

## 2. Outils Manager (`/planning` & Exports)
*Accessible si `user.level >= 2`.*

### A. Pose d'Exceptions (Le "Pinceau")
Sur la vue `/planning` (Grille de l'équipe), le manager dispose d'un outil pour poser rapidement des absences :
*   Sélection d'un type (`VACANCES`, `MALADIE`, `UNLOCK`).
*   Sélection de la période (`AM`, `PM`, `FULL`).
*   Clic sur la case d'un collaborateur à une date précise pour appliquer l'exception en base.

### B. L'Export CSV (Fonctionnalité "Tableur")
Pour compenser l'abandon de "Google Sheets", un export de données plat ultra-complet doit être disponible.
*   **Endpoint** : `GET /api/export/timesheets?start=YYYY-MM-DD&end=YYYY-MM-DD`
*   **Format** : Fichier `.csv` (séparateur `;` pour compatibilité Excel FR).
*   **Structure des colonnes générée** :
    1.  `Date Saisie` (YYYY-MM-DD)
    2.  `Collaborateur` (Nom Prénom)
    3.  `Pôle / Groupe`
    4.  `Client`
    5.  `Projet`
    6.  `Tâche`
    7.  `Heure de Début` (HH:MM)
    8.  `Durée` (en Heures décimales, ex: 1.5 pour 1h30)
    9.  `Note de Plaisir` (1 à 5)
    10. `Statut Journée` (NORMAL, VACANCES, MALADIE...)
*   **Utilité** : Permet au pôle financier ou RH de croiser les données librement (Tableau Croisé Dynamique sur Excel) et de générer la facturation client.
