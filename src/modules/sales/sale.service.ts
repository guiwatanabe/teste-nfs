import 'dotenv/config';
import { salesTable } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import type { Sale } from './sale.model.js';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import { getDbConnection } from '../../db/connection.js';

const db = getDbConnection();

export async function findSaleByUid(uid: string): Promise<Sale | null> {
  const sales = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.uid, uid))
    .limit(1)
    .execute();
  return sales[0] ?? null;
}

export async function findSalesByUserId(userId: number): Promise<Sale[]> {
  const sales = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.user_id, userId))
    .orderBy(desc(salesTable.id))
    .execute();
  return sales;
}

export async function createSale(
  sale: Omit<Sale, 'id'>,
  tx?: PgTransaction<any, any, any>
): Promise<Sale> {
  const [createdSale] = await (tx ?? db).insert(salesTable).values(sale).returning().execute();
  return createdSale!;
}

export async function updateSaleStatus(
  uid: string,
  status: 'PROCESSING' | 'SUCCESS' | 'ERROR',
  tx?: PgTransaction<any, any, any>
): Promise<void> {
  await (tx ?? db).update(salesTable).set({ status }).where(eq(salesTable.uid, uid)).execute();
}

export async function updateSale(
  uid: string,
  updates: Partial<Sale>,
  tx?: PgTransaction<any, any, any>
): Promise<void> {
  await (tx ?? db).update(salesTable).set(updates).where(eq(salesTable.uid, uid)).execute();
}
