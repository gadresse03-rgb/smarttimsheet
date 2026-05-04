# 01. Architecture Système (Local First)

## 1. Vision Globale
L'application "Smart Timesheet" est construite autour d'une architecture monolithique moderne utilisant SvelteKit. Pour la phase de développement et d'installation actuelle, l'approche est **Local First**, s'appuyant sur des technologies ne nécessitant pas d'infrastructure cloud complexe pour démarrer.

| Couche | Technologie | Rôle |
|---|---|---|
| **Framework** | SvelteKit | SSR (Server-Side Rendering), Routing, API Backend |
| **Composants UI** | shadcn-svelte | Blocs d'interface prêts à l'emploi (Boutons, Modales, Formulaires) |
| **Styling** | Tailwind CSS | Utility-first CSS, Design System |
| **Base de Données** | SQLite (fichier local) | Stockage persistant léger (ex: `sqlite.db`) |
| **ORM** | Drizzle ORM | Requêtes type-safe et gestion des migrations |
| **Authentification** | Lucia Auth | Gestion des sessions via cookies HTTP-only |
| **Emails** | Resend | Envoi des relances et rapports transactionnels |

## 2. Stratégie Frontend : UI et État
L'intégration de **shadcn-svelte** permet de répondre à l'exigence d'une interface utilisateur intuitive et rapide à développer sans sacrifier la personnalisation requise par le cahier des charges.

*   **Composants** : Hébergés dans `src/lib/components/ui/`. Ils sont générés localement par la CLI shadcn et restent modifiables à volonté.
*   **Design System** : La configuration globale (couleurs "Note de plaisir", typographie) est centralisée dans `tailwind.config.ts` et `src/app.pcss`.
*   **Gestion d'État** : Svelte 5 (Runes) sera privilégié pour réagir instantanément aux saisies du timesheet (ex: mise à jour du total d'heures en temps réel, gestion du statut "brouillon" ou "soumis").

## 3. Stratégie Backend et Base de Données
Le backend est embarqué directement dans SvelteKit via les fichiers `+server.ts` (API REST/Webhooks) et `+page.server.ts` (Loaders & Form Actions).

*   **Fichier SQLite** : La base de données sera un simple fichier à la racine du projet (ex: `local.db`). Il doit obligatoirement être ajouté au `.gitignore`.
*   **Drizzle ORM** : Utilisé pour sa légèreté. Les schémas seront définis dans `src/lib/server/db/schema.ts`. Les migrations seront générées via `drizzle-kit`.
*   **Pattern d'Accès** : Toute logique d'accès à la base de données doit être encapsulée dans le dossier `src/lib/server/` pour garantir qu'aucun code sensible ne fuité côté client.

## 4. Sécurité et Authentification
**Lucia Auth** gère l'authentification basée sur les sessions, ce qui est plus sécurisé et adapté à ce cas d'usage professionnel que les JWT stockés côté client.

*   **Sessions** : Stockées dans la table SQLite `sessions`.
*   **Cookies** : Configurés en `HttpOnly` et `SameSite=Lax` (ou `Strict`).
*   **Protection des Routes** : Un middleware (SvelteKit `hooks.server.ts`) vérifiera la session à chaque requête et injectera les informations de l'utilisateur (`user.level`, `user.id`) dans l'objet `locals`, sécurisant ainsi l'accès aux pages Manager et Admin.

## 5. Architecture des Automatisations (Webhooks)
Suite à l'analyse des risques liés à `node-cron`, l'approche d'automatisation a été sécurisée et découplée :

*   **Endpoints Dédiés** : Création de routes API spécifiques (ex: `POST /api/crons/daily-reminder`, `POST /api/crons/weekly-report`).
*   **Sécurisation** : Ces routes sont strictement protégées par un header d'autorisation (ex: `Authorization: Bearer CRON_SECRET`).
*   **Exécution Locale** : En développement, ces tâches ne tourneront pas de manière autonome. Les développeurs pourront déclencher et tester les flux d'envois d'emails en appelant manuellement ces routes (via Postman, cURL, ou un bouton dédié dans le back-office Admin).
