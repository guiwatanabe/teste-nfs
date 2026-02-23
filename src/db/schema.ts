import { integer, pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identification: varchar({ length: 255 }).notNull(),
  cpf_cnpj: varchar({ length: 20 }).notNull(),
  municipal_state_registration: varchar({ length: 50 }),
  address: varchar({ length: 255 }).notNull(),
  address_number: varchar({ length: 20 }),
  address_complement: varchar({ length: 255 }),
  address_neighborhood: varchar({ length: 255 }),
  address_municipal_code: varchar({ length: 20 }).notNull(),
  address_city: varchar({ length: 255 }).notNull(),
  address_state: varchar({ length: 2 }).notNull(),
  address_zip_code: varchar({ length: 10 }).notNull(),
  phone_number: varchar({ length: 20 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
});

export const certificatesTable = pgTable('certificates', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => usersTable.id),
  certificate_path: varchar({ length: 255 }).notNull(),
  certificate_password: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull(),
});

export const salesTable = pgTable('sales', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => usersTable.id),
  uid: varchar({ length: 36 }).notNull().unique(),
  identification: varchar({ length: 255 }).notNull(),
  cpf_cnpj: varchar({ length: 20 }).notNull(),
  address: varchar({ length: 255 }).notNull(),
  address_number: varchar({ length: 20 }),
  address_complement: varchar({ length: 255 }),
  address_neighborhood: varchar({ length: 255 }),
  address_city: varchar({ length: 255 }).notNull(),
  address_state: varchar({ length: 2 }).notNull(),
  address_zip_code: varchar({ length: 10 }).notNull(),
  phone_number: varchar({ length: 20 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  description: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 32 }).notNull(),
  xml_data: text(),
  protocol: varchar({ length: 32 }),
  error_message: varchar({ length: 255 }),
  processed_at: timestamp(),
  process_response: text(),
});
