import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import Database from "better-sqlite3";

const sqlite = new Database("local.db");

const adapter = new BetterSqlite3Adapter(sqlite, {
	user: "users",
	session: "sessions"
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			fullName: attributes.fullName,
			level: attributes.level,
            pole: attributes.pole,
            groupName: attributes.groupName
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	fullName: string;
	level: number;
    pole: string | null;
    groupName: string | null;
}
