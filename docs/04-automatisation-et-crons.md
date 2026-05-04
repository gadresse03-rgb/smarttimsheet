# 04. Automatisations et Notifications (Webhooks)

Le cahier des charges prévoit plusieurs relances automatiques par email. Pour éviter les instabilités d'un `node-cron` embarqué, nous utilisons des endpoints API sécurisés (Webhooks) qui seront appelés par un service tiers ou manuellement lors du développement.

## 1. Architecture Sécurisée
*   **Pattern URL** : `/api/cron/[action_name]`
*   **Sécurité stricte** : Chaque requête doit comporter le header `Authorization: Bearer <CRON_SECRET>` (défini dans le `.env`). Si le secret est manquant ou faux, renvoyer `401 Unauthorized`.

## 2. Stratégie d'Idempotence
Pour éviter qu'un timeout de réseau ou qu'un double-appel n'envoie deux fois les relances aux employés :
*   Créer une table `cron_logs` (`id`, `job_name`, `target_date`, `executed_at`).
*   Au début d'un traitement (ex: `job_name="MORNING_CHASER"` pour `target_date="2023-10-02"`), le serveur vérifie si cette combinaison existe. Si oui, il stoppe net avec un statut `200 OK`. Si non, il l'insère et continue.

## 3. Les Flux d'Automatisation (Règles métiers)

### A. Rappel de Fin de Journée (18h00)
*   **Route** : `POST /api/cron/daily-reminder`
*   **Objectif** : Rappeler de remplir le timesheet avant de partir.
*   **Filtre SQL** : 
    *   Sélectionner tous les utilisateurs actifs.
    *   Exclure ceux ayant posé une exception `OFF`, `VACANCES`, `MALADIE`, `RTT` (avec `period="FULL"`) sur la date du jour.
    *   Exclure ceux ayant le flag exception `NO_EMAIL_SOIR`.
    *   *Optimisation optionnelle* : Exclure ceux qui ont déjà soumis au moins 1h aujourd'hui (pour éviter le spam).
*   **Action** : Boucle sur les emails via le SDK **Resend**. (Utiliser `Promise.allSettled` pour que l'échec d'un email ne bloque pas les autres).

### B. Relance Matinale J+1 (09h00)
*   **Route** : `POST /api/cron/morning-chaser`
*   **Objectif** : Rattraper ceux qui ont oublié la veille.
*   **Logique temporelle** : La cible de validation est `Aujourd'hui - 1 jour`. (Si exécuté le lundi, il faut configurer la requête pour cibler le vendredi, soit `J-3`).
*   **Algorithme de détection** :
    1. Pour chaque utilisateur, sommer la `duration_min` validée pour la date cible.
    2. Calculer le quota attendu : 480 min (8h) par défaut, ou 240 min (4h) si une exception type `AM`/`PM` existe ce jour-là.
    3. Si la somme est strictement inférieure au quota attendu => Envoi de la relance.

### C. Rapport Manager Quotidien (14h00)
*   **Route** : `POST /api/cron/manager-report-daily`
*   **Objectif** : Informer les managers de l'état de saisie de leur équipe.
*   **Processus** :
    1. Exécuter l'algorithme "Relance Matinale" pour générer la liste des "En retard" et la liste des "À jour".
    2. Construire un tableau HTML récapitulatif.
    3. Trouver les managers concernés (via `level=2` et potentiellement filtre par `pole` ou `group_name`).
    4. Envoyer l'email récapitulatif.
