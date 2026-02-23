import type { InferSelectModel } from 'drizzle-orm';
import { certificatesTable } from '../../db/schema.js';

export type Certificate = InferSelectModel<typeof certificatesTable>;
