# 02. Modèle de Données et Authentification

## 1. Choix Technologiques
- **Base de données** : SQLite (fichier local pour le dev)
- **ORM** : Drizzle ORM (fichiers de schéma dans `src/lib/server/db/schema.ts`)
- **Authentification** : Lucia Auth (v3)

## 2. Schéma de Base de Données (Drizzle ORM)

### Table `users`
Stocke les informations des collaborateurs.
```typescript
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  level: integer('level').notNull(), // 1: Employé, 2: Manager, 3: Admin/Direction
  pole: text('pole'),
  groupName: text('group_name'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### Table `sessions` (Lucia Auth)
Essentielle pour la gestion sécurisée des connexions.
```typescript
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at').notNull(),
});
```

### Table `timesheets`
C'est le cœur du système. Chaque ligne correspond à un créneau horaire (granularité à l'heure).
```typescript
export const timesheets = sqliteTable('timesheets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // Format standard YYYY-MM-DD
  startHour: integer('start_hour').notNull(), // ex: 9 (pour 9h00)
  durationMin: integer('duration_min').notNull(), // ex: 60, 120 (en minutes)
  client: text('client'),
  project: text('project'),
  subProject: text('sub_project'),
  task: text('task').notNull(),
  pleasureNote: integer('pleasure_note'), // 1 à 5, requis si status='NORMAL'
  status: text('status', { enum: ['NORMAL', 'DRAFT'] }).default('NORMAL'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### Table `day_exceptions` (Absences & Demi-journées)
Gère les absences, les déblocages de saisie rétroactive (`UNLOCK`) et la gestion fine des demi-journées.
```typescript
export const dayExceptions = sqliteTable('day_exceptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  type: text('type').notNull(), // 'OFF', 'VACANCES', 'MALADIE', 'RTT', 'UNLOCK'
  period: text('period', { enum: ['AM', 'PM', 'FULL'] }).default('FULL').notNull(),
  note: text('note'),
});
```
> **Logique Métier (period)** : L'ajout du champ `period` est crucial. Si un employé pose un `type="VACANCES"` avec `period="AM"`, le système saura qu'il doit attendre une saisie de 4 heures l'après-midi, et non pas 8h, pour considérer la journée comme validée.

### Table `parameters`
Valeurs dynamiques pour alimenter les listes déroulantes (permet l'évolutivité demandée).
```typescript
export const parameters = sqliteTable('parameters', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'CLIENT', 'PROJET', 'TACHE'
  value: text('value').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});
```

## 3. Configuration Lucia Auth
- L'adaptateur sera `@lucia-auth/adapter-sqlite` connecté via `better-sqlite3`.
- Les attributs exposés dans la session (injectés via `hooks.server.ts` dans `event.locals`) contiendront `email`, `fullName`, et surtout `level`. Cela permet de vérifier les droits d'accès (Manager/Admin) directement dans les routes frontend sans avoir à refaire de requêtes SQL.
