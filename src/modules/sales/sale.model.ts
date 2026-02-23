import type { InferSelectModel } from 'drizzle-orm';
import { salesTable } from '../../db/schema.js';

export type Sale = InferSelectModel<typeof salesTable>;