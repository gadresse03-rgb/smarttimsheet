import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	fullName: text('full_name').notNull(),
	level: integer('level').notNull(), // 1: Employé, 2: Manager, 3: Admin/Direction
	pole: text('pole'),
	groupName: text('group_name'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id),
	expiresAt: integer('expires_at').notNull()
});

export const timesheets = sqliteTable('timesheets', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id),
	date: text('date').notNull(), // Format standard YYYY-MM-DD
	startHour: integer('start_hour').notNull(), // ex: 9
	durationMin: integer('duration_min').notNull(), // ex: 60
	client: text('client'),
	project: text('project'),
	subProject: text('sub_project'),
	task: text('task').notNull(),
	pleasureNote: integer('pleasure_note'), // 1 à 5
	status: text('status', { enum: ['NORMAL', 'DRAFT'] }).default('NORMAL'),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const dayExceptions = sqliteTable('day_exceptions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id),
	date: text('date').notNull(),
	type: text('type').notNull(), // 'OFF', 'VACANCES', 'MALADIE', 'RTT', 'UNLOCK'
	period: text('period', { enum: ['AM', 'PM', 'FULL'] }).default('FULL').notNull(),
	note: text('note')
});

export const parameters = sqliteTable('parameters', {
	id: text('id').primaryKey(),
	type: text('type').notNull(), // 'CLIENT', 'PROJET', 'TACHE'
	value: text('value').notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).default(true)
});
