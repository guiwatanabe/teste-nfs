import { usersTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { User } from './user.model.js';
import { getDbConnection } from '../../db/connection.js';

const db = getDbConnection();

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1)
    .execute();
  return users[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1).execute();
  return users[0] ?? null;
}
