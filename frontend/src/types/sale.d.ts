import type { User } from './user';

export type SaleStatus = 'PROCESSING' | 'SUCCESS' | 'ERROR';

export type Sale = {
  id: string;
  user: User;
  uid: string;
  identification: string;
  municipal_state_registration?: string | null;
  cpf_cnpj: string;
  address: string;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  phone_number: string;
  email: string;
  amount: number;
  description: string;
  status: SaleStatus;
  xml_data: string | null;
  protocol: string | null;
  error_message: string | null;
  processed_at: Date | null;
  process_response: string | null;
};
