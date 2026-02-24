export type User = {
  id: number;
  identification: string;
  cpf_cnpj: string;
  municipal_state_registration?: string;
  address: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_municipal_code: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  phone_number: string;
  email: string;
  username: string;
};
