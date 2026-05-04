# 09. Données de Test (Seed Data)

Ce document définit le jeu de données initial qui sera injecté dans la base SQLite locale via le script `scripts/seed.ts`. L'objectif est de pouvoir tester immédiatement chaque fonctionnalité dès qu'elle est codée.

## 1. Utilisateurs

| Nom Complet | Email | Niveau | Pôle | Groupe |
|---|---|---|---|---|
| Arthur | arthur@innocean.fr | 3 (Direction) | Direction | — |
| Pierre | pierre@innocean.fr | 2 (Manager) | Tech | Digital |
| Alexis | alexis@innocean.fr | 1 (Employé) | Tech | Digital |
| Avidan | avidan@innocean.fr | 1 (Employé) | Créa | Digital |

> **Mot de passe par défaut** : `password123` (hashé en base). Sera changé à la première connexion en production.

## 2. Paramètres (Listes Déroulantes)

### Clients
| Valeur | Actif |
|---|---|
| Interne | ✅ |
| INNOCEAN | ✅ |
| Hyundai | ✅ |
| Kia | ✅ |

### Projets
| Valeur | Actif |
|---|---|
| Smart Timesheet | ✅ |
| Refonte Site Web | ✅ |
| Campagne Hiver | ✅ |

### Tâches
| Valeur | Actif |
|---|---|
| Développement | ✅ |
| Design / Maquettage | ✅ |
| Réunion | ✅ |
| Gestion de Projet | ✅ |
| QA & Tests | ✅ |

## 3. Exceptions de Test

| Utilisateur | Date | Type | Période | Note |
|---|---|---|---|---|
| Alexis | Demain (J+1) | VACANCES | FULL | Test blocage saisie journée complète |
| Avidan | Demain (J+1) | RTT | PM | Test quota réduit à 4h (matin uniquement) |

## 4. Timesheets Exemples (pour tester les vues)

| Utilisateur | Date | Heure Début | Durée | Client | Projet | Tâche | Note Plaisir |
|---|---|---|---|---|---|---|---|
| Alexis | Aujourd'hui | 9 | 120 min | Interne | Smart Timesheet | Développement | 4 |
| Alexis | Aujourd'hui | 11 | 60 min | Interne | Smart Timesheet | Réunion | 3 |
| Alexis | Aujourd'hui | 14 | 180 min | Hyundai | Refonte Site Web | Développement | 5 |
| Avidan | Aujourd'hui | 9 | 240 min | Kia | Campagne Hiver | Design / Maquettage | 4 |
| Pierre | Aujourd'hui | 9 | 60 min | Interne | Smart Timesheet | Gestion de Projet | 3 |
| Pierre | Aujourd'hui | 10 | 120 min | INNOCEAN | Refonte Site Web | Réunion | 2 |
