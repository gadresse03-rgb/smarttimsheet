# CLAUDE.md — Smart Timesheet (DayTrack)

## Contexte du projet

Application de suivi du temps pour une agence. Permet aux employés de saisir leurs heures heure par heure, avec une note de plaisir, et donne aux managers une vue consolidée de l'activité et du bien-être de l'équipe.

**Refonte décidée** : abandon de la stack Astro + Supabase. La nouvelle version est construite avec **SvelteKit + SQLite (via Turso ou fichier local selon l'environnement)**.

---

## Stack cible (v2)

| Couche | Technologie |
|---|---|
| Frontend | SvelteKit (SSR + client) |
| Styles | Tailwind CSS + shadcn-svelte |
| Base de données | SQLite — Turso (prod) / fichier local (dev) |
| ORM | Drizzle ORM |
| Auth | Lucia Auth (session-based, email/password) |
| Emails | Resend (transactionnel) |
| Scheduler | API Webhooks sécurisés (déclenchés par ordonnanceur externe) |
| Charts | Chart.js ou Recharts (via svelte-chartjs) |
| Déploiement | Fly.io ou Railway (Node adapter) |

---

## Modèle de données (SQLite / Drizzle)

### `users`
```
id          TEXT PK
email       TEXT UNIQUE NOT NULL
full_name   TEXT NOT NULL
level       INTEGER NOT NULL  -- 1=employé, 2=manager, 3=direction
pole        TEXT
group_name  TEXT
is_active   INTEGER DEFAULT 1
created_at  TEXT
```

### `timesheets`
```
id            TEXT PK
user_id       TEXT FK → users.id
date          TEXT NOT NULL          -- YYYY-MM-DD
start_hour    INTEGER NOT NULL       -- heure de début (ex: 9)
duration_min  INTEGER NOT NULL       -- durée en minutes
client        TEXT
project       TEXT
sub_project   TEXT
task          TEXT NOT NULL
pleasure_note INTEGER                -- 1 à 5
status        TEXT DEFAULT 'NORMAL'  -- NORMAL | DRAFT
created_at    TEXT
updated_at    TEXT
```

### `day_exceptions`
```
id      TEXT PK
user_id TEXT FK → users.id
date    TEXT NOT NULL
type    TEXT NOT NULL  -- OFF | VACANCES | MALADIE | RTT | NO_EMAIL_SOIR | NO_EMAIL_MATIN | UNLOCK
period  TEXT NOT NULL DEFAULT 'FULL' -- AM | PM | FULL (Gestion des demi-journées)
note    TEXT
```

### `parameters`
```
id        TEXT PK
type      TEXT NOT NULL   -- CLIENT | PROJET | TACHE
value     TEXT NOT NULL
is_active INTEGER DEFAULT 1
```

### `sessions` (géré par Lucia)
```
id         TEXT PK
user_id    TEXT FK → users.id
expires_at TEXT
```

---

## Règles métier

- **Granularité** : saisie heure par heure. Un créneau = 1 ligne en base avec `start_hour` + `duration_min`.
- **Chevauchement** : deux créneaux ne peuvent pas se chevaucher sur la même journée pour le même utilisateur. Valider côté serveur.
- **Saisie rétroactive** : autorisée jusqu'à J+3 par défaut (incluant les week-ends). Le manager peut poser une exception `UNLOCK` sur un utilisateur/date pour lever cette limite.
- **Note de plaisir** : obligatoire à la soumission (pas pour les brouillons).
- **Statuts journée** : `OFF` avec `period="FULL"` bloque la saisie. Si `period="AM"/"PM"`, le quota attendu passe de 8h à 4h.
- **Roles** :
  - Niveau 1 (employé) : saisie uniquement sur son propre compte.
  - Niveau 2 (manager) : lecture de toute son équipe, peut poser des exceptions, reçoit les rapports.
  - Niveau 3 (direction) : lecture globale, ne saisit pas de timesheet.

---

## Automatisations à implémenter (Webhooks via /api/cron/*)

| Horaire | Action |
|---|---|
| Tous les jours 18h00 | Email de rappel à tous les employés actifs sans exception `NO_EMAIL_SOIR` |
| Tous les jours 09h00 | Email de relance aux employés qui n'ont pas rempli la veille (sauf `NO_EMAIL_MATIN` ou `OFF/VACANCES/MALADIE`) |
| Tous les jours 14h00 | Rapport au(x) manager(s) : liste "À jour" vs "En retard" pour J-1 |
| Tous les lundis 08h00 | Rapport hebdomadaire au manager (semaine précédente) |
| 1er de chaque mois 08h00 | Rapport mensuel au manager (mois précédent) |

Chaque cron doit logger son exécution et les erreurs d'envoi email sans crasher le process.

---

## Fonctionnalités UI à implémenter

### Formulaire de saisie (`/saisie`)
- [ ] Sélecteur de date (avec restriction J+3 sauf UNLOCK)
- [ ] Détection automatique si la journée a un statut spécial (OFF, VACANCES…)
- [ ] Ajout de créneaux horaires (heure de début, durée)
- [ ] Palettes en cascade : Client → Projet → Sous-projet → Tâche (Combobox shadcn)
- [ ] Bouton "+ Ajouter" (ouvre une modale pop-up) si absent de la liste → crée un paramètre en base
- [ ] Note de plaisir (1-5 étoiles) par créneau
- [ ] Bouton "Sauvegarder brouillon" (status=DRAFT) et "Soumettre"
- [ ] Chargement du brouillon existant à l'ouverture
- [ ] Templates : sauvegarder une journée type, la recharger

### Agenda (`/agenda`)
- [ ] Vue Jour : liste des créneaux du jour, couleur selon note de plaisir
- [ ] Vue Semaine : 7 colonnes, badges "rempli / manquant / en cours"
- [ ] Vue Mois : grille calendrier avec indicateur par jour

### Stats (`/stats`)
- [ ] KPIs : heures totales, note de plaisir moyenne, top tâche, top client
- [ ] Graphique courbe : activité dans le temps
- [ ] Graphique donut : répartition par client
- [ ] Graphique barres : note de plaisir par tâche
- [ ] Filtres : période (semaine / mois / custom), membre (managers uniquement)

### Planning équipe (`/planning` — managers)
- [ ] Grille semaine avec un membre par ligne
- [ ] Indicateurs : rempli ✓, manquant ✗, exception (congés, maladie…)
- [ ] Pinceau pour poser une exception sur un membre/date
- [ ] Vue drill-down sur un membre

### Admin (`/admin` — direction)
- [ ] Gestion des utilisateurs (CRUD)
- [ ] Gestion des paramètres (clients, projets, tâches)

---

## Roadmap de développement

### Phase 0 — Setup (J1-J2)
- [ ] Init SvelteKit avec TypeScript + Tailwind
- [ ] Setup Drizzle ORM + SQLite (fichier local dev, Turso prod)
- [ ] Écrire et appliquer les migrations du schéma
- [ ] Setup Lucia Auth (inscription / connexion / sessions)
- [ ] Setup Resend pour l'envoi d'emails
- [ ] Variables d'environnement : `DATABASE_URL`, `RESEND_API_KEY`, `SESSION_SECRET`

### Phase 1 — Core : saisie & stockage (J3-J7)
- [ ] Routes API : `POST /api/timesheets`, `GET /api/timesheets?date=`, `PUT /api/timesheets/:id`, `DELETE /api/timesheets/:id`
- [ ] Validation serveur : chevauchements, règle J+2, note de plaisir obligatoire
- [ ] Page `/saisie` complète (formulaire avec brouillons)
- [ ] Page `/agenda` vues Jour + Semaine + Mois
- [ ] CRUD paramètres (clients/projets/tâches) via API

### Phase 2 — Rôles & équipe (J8-J12)
- [ ] Middleware d'autorisation basé sur `user.level`
- [ ] Page `/planning` pour les managers
- [ ] CRUD exceptions (`day_exceptions`)
- [ ] Vue drill-down membre
- [ ] Page `/admin` pour la direction

### Phase 3 — Automatisations email (J13-J17)
- [ ] Intégration Resend avec templates HTML (rappel, relance, rapport)
- [ ] Mise en place des 5 crons (voir tableau ci-dessus)
- [ ] Logique de détection "a rempli la veille" (avec gestion exceptions)
- [ ] Tests manuels des crons via endpoint `/api/cron/test?job=rappel` (désactivé en prod)

### Phase 4 — Stats & rapports (J18-J22)
- [ ] Page `/stats` avec tous les graphiques
- [ ] Requêtes SQL agrégées pour les KPIs
- [ ] Génération du rapport hebdo + mensuel en HTML/email
- [ ] Export CSV des données (pour le manager)

### Phase 5 — Polish & déploiement (J23-J28)
- [ ] Responsive mobile (formulaire de saisie notamment)
- [ ] Gestion des erreurs réseau avec toast + retry
- [ ] Accessibilité basique (ARIA labels, focus trap sur modals)
- [ ] Tests de non-régression (Playwright sur les flux critiques)
- [ ] Déploiement sur Fly.io / Railway avec Turso en prod
- [ ] Documentation utilisateur (guide de saisie)

---

## Points de vigilance

1. **Auth** : utiliser des cookies `httpOnly` + `SameSite=strict` pour les sessions. Ne jamais exposer le session token en JS.
2. **SQLite en prod** : Turso est le choix recommandé pour avoir un SQLite accessible depuis un serveur Node sans gestion de volume. En alternative, PocketBase ou une instance Railway SQLite persistent.
3. **Crons** : s'assurer que le cron ne tourne que sur **une seule instance** en prod (éviter les doublons d'emails si scale horizontal). Ajouter une table `cron_logs` pour idempotence.
4. **Chevauchements** : valider côté serveur avec une requête SQL `WHERE user_id = ? AND date = ? AND start_hour < ? + duration AND start_hour + duration > ?`.
5. **Emails** : ne pas bloquer la requête HTTP sur l'envoi email — utiliser `await` dans le cron mais pas dans les requêtes utilisateur.

---

## Ce qui est récupérable depuis l'ancienne version

- Logique de calcul des statistiques (moyenne plaisir, top tâche) — à portager en SQL
- Palette de couleurs CSS (variable `--couleur-*`)
- Logique de détection weekend / lundi de semaine
- Templates HTML des vues Jour/Semaine/Mois (structure visuelle)
- Liste des types d'exceptions
