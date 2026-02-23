import { certificatesTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { Certificate } from './certificate.model.js';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import { getDbConnection } from '../../db/connection.js';

const db = getDbConnection();

export async function findCertificateById(id: number): Promise<Certificate | null> {
  const certificates = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.id, id))
    .limit(1)
    .execute();
  return certificates[0] ?? null;
}

export async function findCertificateByUserId(userId: number): Promise<Certificate | null> {
  const certificates = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.user_id, userId))
    .limit(1)
    .execute();
  return certificates[0] ?? null;
}

export async function createCertificate(
  certificate: Omit<Certificate, 'id'>,
  tx?: PgTransaction<any, any, any>
): Promise<Certificate> {
  const existingCertificate = await findCertificateByUserId(certificate.user_id);
  if (existingCertificate) {
    const [updatedCertificate] = await (tx ?? db)
      .update(certificatesTable)
      .set(certificate)
      .where(eq(certificatesTable.user_id, certificate.user_id))
      .returning()
      .execute();
    return updatedCertificate!;
  }

  const [createdCertificate] = await (tx ?? db)
    .insert(certificatesTable)
    .values(certificate)
    .returning()
    .execute();
  return createdCertificate!;
}
