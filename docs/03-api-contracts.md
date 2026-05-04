# 03. Contrats d'API (Routes et Validation)

Les échanges entre le client SvelteKit et le serveur se feront majoritairement via des **Server Actions** (pour les soumissions de formulaires natives) et des **Endpoints API REST (`+server.ts`)** (pour la récupération asynchrone ou l'enregistrement en arrière-plan).

## 1. Standardisation de la Validation
La fiabilité des données est assurée par la validation stricte via **Zod** côté serveur.

**Exemple de schéma Zod pour l'ajout d'un créneau :**
```typescript
const TimesheetEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD requis"),
  startHour: z.number().min(0).max(23),
  durationMin: z.number().positive(),
  client: z.string().optional(),
  project: z.string().optional(),
  task: z.string().min(1, "La tâche est requise"),
  pleasureNote: z.number().min(1).max(5).optional(), // Requis en soumission finale, optionnel en brouillon
  isDraft: z.boolean().default(false)
});
```

## 2. Contrats de l'API : Timesheets

### `POST /api/timesheets` (ou Action SvelteKit)
Création ou mise à jour (sauvegarde d'une journée complète ou partielle).
*   **Payload Entrant** : `{ entries: TimesheetEntry[], isDraft: boolean }`
*   **Règles métier validées par le serveur** :
    1.  **Saisie rétroactive J+3** : Si `date` est antérieure à `Aujourd'hui - 3 jours` (en tenant compte des week-ends si besoin), rejeter avec une erreur `403 Forbidden`, SAUF SI une exception `UNLOCK` existe pour cet utilisateur à cette date.
    2.  **Chevauchements** : Vérifier en SQL que `startHour + (durationMin / 60)` ne se superpose pas avec un créneau existant sur cette même date.
    3.  **Note de plaisir** : Rejeter si `isDraft` est `false` et qu'une ligne manque de `pleasureNote`.
*   **Réponse** : `200 OK` (succès) ou `400 Bad Request` (avec liste structurée des erreurs Zod/Métier).

### `GET /api/timesheets?date=YYYY-MM-DD`
*   **Réponse** : Tableau JSON des créneaux de l'utilisateur connecté pour la date donnée. Sert à peupler le formulaire au chargement de la page.

## 3. Contrats de l'API : Paramètres (Évolutivité)

### `POST /api/parameters`
Répond au besoin du cahier des charges : "L'utilisateur doit pouvoir ajouter facilement une nouvelle tâche ou sujet s'il n'est pas listé."
*   **Payload Entrant** : `{ type: 'TACHE' | 'PROJET' | 'CLIENT', value: 'Nouveau nom' }`
*   **Action** : Insère la valeur en base (table `parameters`) si elle n'existe pas déjà (check case-insensitive).
*   **Réponse** : L'ID de l'objet créé, pour mise à jour immédiate de la liste déroulante côté client.

## 4. Contrats de l'API : Managers (Planning)

### `GET /api/planning?week=YYYY-WXX`
*   **Sécurité** : Middleware vérifiant `locals.user.level >= 2`.
*   **Réponse** : Un tableau consolidé de l'équipe du manager.
    *   Exemple de structure : `[{ userId: "...", fullName: "...", days: { "2023-10-02": { status: "COMPLET", hours: 8, exception: null }, ... } }]`
