# 07. Design des Emails et Rapports

L'application communique activement avec les utilisateurs via des automatisations. Il est crucial que ces emails soient professionnels, clairs, et optimisés pour la délivrabilité.

## 1. Choix Technologique
*   **Envoi** : Resend (API Node.js).
*   **Templating** : Utilisation de `svelte-email` (ou composants React-email convertis). Cela permet de coder les emails avec la syntaxe Svelte et Tailwind CSS, puis de les compiler en HTML compatible avec la majorité des clients mails (Outlook, Gmail).

## 2. Emails à destination des Employés

### A. Rappel de fin de journée (18h00)
*   **Sujet** : `⏳ N'oublie pas de remplir ton Timesheet !`
*   **Ton** : Bienveillant et incitatif.
*   **Contenu** :
    *   Titre : "C'est la fin de la journée !"
    *   Texte : "Prends 2 minutes pour saisir tes heures et ta note de plaisir pour la journée d'aujourd'hui."
    *   Bouton (Call to Action) : Lien direct et bien visible vers `https://[app-url]/saisie?date=YYYY-MM-DD`.

### B. Relance Matinale J+1 (09h00)
*   **Sujet** : `⚠️ Action requise : Timesheet incomplet pour hier`
*   **Ton** : Un peu plus formel/urgent.
*   **Contenu** :
    *   Texte : "Il semblerait que tu n'aies pas complété (ou pas atteint le quota de 8h) sur ton timesheet de [Jour de la semaine, ex: Lundi]."
    *   Précision : Si une exception "AM" ou "PM" est posée, le texte s'adapte ("quota de 4h").
    *   Bouton : Lien direct vers `https://[app-url]/saisie?date=YYYY-MM-DD` de la *veille*.

## 3. Rapports à destination des Managers

### C. Rapport Quotidien de Saisie (14h00)
*   **Sujet** : `📊 Statut des saisies de votre équipe (J-1)`
*   **Contenu visuel** (Tableau à deux colonnes) :
    *   🟢 **À Jour (✓)** : Liste des employés ayant rempli leur quota.
    *   🔴 **En Retard (✗)** : Liste des employés n'ayant pas atteint le quota.
    *   *Note* : Les employés en "OFF/VACANCES" sont mentionnés en gris (Exceptions).

### D. Rapports Hebdomadaire (Lundi 08h00) & Mensuel (Le 1er)
*   **Sujet** : `📈 Synthèse d'activité - Semaine [X] / Mois de [Mois]`
*   **Contenu Agrégé** :
    1.  **KPI 1** : Total des heures saisies par l'équipe.
    2.  **KPI 2** : Note de plaisir moyenne globale de l'équipe (sur 5).
    3.  **Top 3 Projets** : Les projets ayant consommé le plus de temps (avec %).
    4.  **Alerte "Santé"** : Si la note de plaisir moyenne d'un collaborateur passe en dessous de 2.5 sur la période, ajouter un encart discret d'alerte pour le manager.
    5.  Bouton : Lien direct vers `https://[app-url]/stats` pour voir le détail.
