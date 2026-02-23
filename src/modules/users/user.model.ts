import type { InferSelectModel } from 'drizzle-orm';
import { usersTable } from '../../db/schema.js';

export type User = InferSelectModel<typeof usersTable>;
