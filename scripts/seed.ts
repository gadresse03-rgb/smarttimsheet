/**
 * Script de Seed — Smart Timesheet
 *
 * Usage : npx tsx scripts/seed.ts
 *
 * Ce script initialise la base de données locale (local.db) avec :
 *   - 4 utilisateurs (Direction, Manager, 2 Employés)
 *   - Des paramètres (Clients, Projets, Tâches)
 *   - Des exceptions de test
 *   - Des timesheets exemples
 */

import Database from 'better-sqlite3';
import crypto from 'crypto';

// --- Helpers ---
function generateId() {
	return crypto.randomUUID();
}

function today() {
	return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function tomorrow() {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().split('T')[0];
}

// --- Connexion à la base ---
const db = new Database('local.db');

// Activer le mode WAL pour de meilleures performances
db.pragma('journal_mode = WAL');

// --- Création des tables (si pas déjà faites via migration) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    level INTEGER NOT NULL,
    pole TEXT,
    group_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timesheets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    start_hour INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    client TEXT,
    project TEXT,
    sub_project TEXT,
    task TEXT NOT NULL,
    pleasure_note INTEGER,
    status TEXT DEFAULT 'NORMAL',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS day_exceptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    period TEXT NOT NULL DEFAULT 'FULL',
    note TEXT
  );

  CREATE TABLE IF NOT EXISTS parameters (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
  );
`);

// --- Nettoyage ---
console.log('🗑️  Nettoyage des données existantes...');
db.exec('DELETE FROM timesheets');
db.exec('DELETE FROM day_exceptions');
db.exec('DELETE FROM sessions');
db.exec('DELETE FROM parameters');
db.exec('DELETE FROM users');

// --- 1. Utilisateurs ---
console.log('👤 Création des utilisateurs...');

const arthurId = generateId();
const pierreId = generateId();
const alexisId = generateId();
const avidanId = generateId();

const insertUser = db.prepare(`
  INSERT INTO users (id, email, full_name, level, pole, group_name)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertUser.run(arthurId, 'arthur@innocean.fr', 'Arthur', 3, 'Direction', null);
insertUser.run(pierreId, 'pierre@innocean.fr', 'Pierre', 2, 'Tech', 'Digital');
insertUser.run(alexisId, 'alexis@innocean.fr', 'Alexis', 1, 'Tech', 'Digital');
insertUser.run(avidanId, 'avidan@innocean.fr', 'Avidan', 1, 'Créa', 'Digital');

console.log('   ✅ Arthur (Direction), Pierre (Manager), Alexis (Employé), Avidan (Employé)');

// --- 2. Paramètres ---
console.log('📋 Création des paramètres (listes déroulantes)...');

const insertParam = db.prepare(`
  INSERT INTO parameters (id, type, value, is_active) VALUES (?, ?, ?, 1)
`);

const clients = ['Interne', 'INNOCEAN', 'Hyundai', 'Kia'];
const projets = ['Smart Timesheet', 'Refonte Site Web', 'Campagne Hiver'];
const taches = ['Développement', 'Design / Maquettage', 'Réunion', 'Gestion de Projet', 'QA & Tests'];

clients.forEach((c) => insertParam.run(generateId(), 'CLIENT', c));
projets.forEach((p) => insertParam.run(generateId(), 'PROJET', p));
taches.forEach((t) => insertParam.run(generateId(), 'TACHE', t));

console.log(`   ✅ ${clients.length} clients, ${projets.length} projets, ${taches.length} tâches`);

// --- 3. Exceptions de test ---
console.log('🏖️  Création des exceptions de test...');

const insertException = db.prepare(`
  INSERT INTO day_exceptions (id, user_id, date, type, period, note) VALUES (?, ?, ?, ?, ?, ?)
`);

const tomorrowDate = tomorrow();
insertException.run(generateId(), alexisId, tomorrowDate, 'VACANCES', 'FULL', 'Test blocage saisie journée complète');
insertException.run(generateId(), avidanId, tomorrowDate, 'RTT', 'PM', 'Test quota réduit à 4h (matin uniquement)');

console.log(`   ✅ Alexis : VACANCES (FULL) le ${tomorrowDate}`);
console.log(`   ✅ Avidan : RTT (PM) le ${tomorrowDate}`);

// --- 4. Timesheets exemples ---
console.log('⏱️  Création des timesheets exemples...');

const insertTimesheet = db.prepare(`
  INSERT INTO timesheets (id, user_id, date, start_hour, duration_min, client, project, task, pleasure_note, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NORMAL')
`);

const todayDate = today();

// Alexis : 3 créneaux = 6h (9h-11h, 11h-12h, 14h-17h)
insertTimesheet.run(generateId(), alexisId, todayDate, 9, 120, 'Interne', 'Smart Timesheet', 'Développement', 4);
insertTimesheet.run(generateId(), alexisId, todayDate, 11, 60, 'Interne', 'Smart Timesheet', 'Réunion', 3);
insertTimesheet.run(generateId(), alexisId, todayDate, 14, 180, 'Hyundai', 'Refonte Site Web', 'Développement', 5);

// Avidan : 1 créneau = 4h (matin complet)
insertTimesheet.run(generateId(), avidanId, todayDate, 9, 240, 'Kia', 'Campagne Hiver', 'Design / Maquettage', 4);

// Pierre : 2 créneaux = 3h
insertTimesheet.run(generateId(), pierreId, todayDate, 9, 60, 'Interne', 'Smart Timesheet', 'Gestion de Projet', 3);
insertTimesheet.run(generateId(), pierreId, todayDate, 10, 120, 'INNOCEAN', 'Refonte Site Web', 'Réunion', 2);

console.log(`   ✅ 6 créneaux créés pour le ${todayDate}`);

// --- Résumé ---
console.log('\n🎉 Seed terminé avec succès !');
console.log(`   Base de données : local.db`);
console.log(`   Utilisateurs : 4`);
console.log(`   Paramètres : ${clients.length + projets.length + taches.length}`);
console.log(`   Exceptions : 2`);
console.log(`   Timesheets : 6`);

db.close();
