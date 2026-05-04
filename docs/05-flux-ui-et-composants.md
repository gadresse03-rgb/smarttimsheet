# 05. Flux UI et Composants (shadcn-svelte)

Le Front-end sera développé en **Svelte 5** pour profiter du système réactif des **Runes** (`$state`, `$derived`), garantissant des formulaires très réactifs.

## 1. Arborescence Visuelle des Pages
*   **`/login`** : Formulaire simple email/password.
*   **`/saisie`** (Employé) : Formulaire principal de déclaration.
*   **`/agenda`** (Employé) : Vue historique sous forme de calendrier (Jour/Semaine/Mois).
*   **`/stats`** (Tous) : Tableau de bord visuel (heures travaillées, moyenne de la note de plaisir).
*   **`/planning`** (Manager) : Vue consolidée de l'équipe avec indicateurs visuels (✓, ✗).

## 2. Stratégie UI : Composants shadcn-svelte
Plutôt que de construire chaque élément de zéro, `shadcn-svelte` (couplé à Tailwind) fournira l'ossature, garantissant rapidité et design professionnel :

*   `Calendar` / `DatePicker` : Pour le choix de la date dans `/saisie`. Il devra être enrichi visuellement pour afficher des "points rouges" sur les jours incomplets en retard (passé J-1).
*   `Command` / `Combobox` : Indispensable pour les champs "Tâche", "Projet" et "Client". Cela permet la recherche rapide dans de longues listes. Une ligne "Créer '[Valeur saisie]'" apparaîtra si la recherche échoue, pointant vers l'API d'ajout.
*   `Toast` (Sonner) : Pour afficher les notifications de sauvegarde silencieuse ou les erreurs.
*   `Alert / Dialog` : Modales pour confirmer des actions destructrices ou envoyer des avertissements (ex: "Vous essayez de soumettre avec moins de 8h saisies").

## 3. Gestion d'État de la Page `/saisie` (Formulaire)
C'est l'interface la plus critique. L'état doit être robuste et gérer les pertes de connexion.

**Store Svelte 5 (Runes) :**
```javascript
let currentDate = $state(new Date());
let entries = $state([]); // Liste des créneaux
let expectedHours = $state(8); // Sera ajusté à 4 si une exception AM/PM existe

let totalSaisi = $derived(entries.reduce((acc, entry) => acc + entry.durationMin, 0) / 60);
```

**Auto-Save et Mode Brouillon :**
1.  **Sauvegarde Locale** : À chaque modification de l'état `entries`, un watcher (`$effect`) sauvegarde silencieusement l'état dans le `localStorage`. Si l'utilisateur ferme l'onglet par erreur, le formulaire est restauré au retour.
2.  **Sauvegarde API (Brouillon)** : Un bouton "Enregistrer le brouillon" ou un système de *debouncing* (toutes les X secondes d'inactivité) envoie le payload vers `POST /api/timesheets` avec `isDraft: true`. Les règles de validation sont relâchées (Note de plaisir non obligatoire).
3.  **Soumission Finale** : Valide strictement toutes les règles (temps plein atteint, notes attribuées, pas de chevauchements) et passe les créneaux en `status='NORMAL'`.

## 4. Visualisation (Dashboard & Planning)
Pour le module "Data Visualisation" mentionné dans le cahier des charges :
*   **Tableau de bord de saisie** : Affichera une jauge de progression circulaire (ex: "6h / 8h saisies").
*   **Graphiques de Plaisir** : Un graphique (bar chart simple) montrant la corrélation entre les types de "Tâches" et la "Note de Plaisir" moyenne, aidant ainsi le management à comprendre les irritants de l'équipe.
