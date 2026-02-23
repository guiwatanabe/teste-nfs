import 'dotenv/config';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDbConnection } from '../db/connection.js';

const DEFAULT_USER = {
  identification: 'Default User',
  cpf_cnpj: '111.444.777-35',
  municipal_state_registration: '123456789',
  address: 'Praça da Sé',
  address_number: '1',
  address_complement: null,
  address_neighborhood: 'Sé',
  address_municipal_code: '123456',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01001-000',
  phone_number: '11999999999',
  email: 'default@example.com',
  username: 'admin',
  password_hash: bcrypt.hashSync('admin', 10),
};

async function main() {
  const db = getDbConnection();

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, DEFAULT_USER.username));
  if (existing.length === 0) {
    await db.insert(usersTable).values(DEFAULT_USER);
    console.log('Default user seeded.');
  } else {
    console.log('Default user already exists.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
