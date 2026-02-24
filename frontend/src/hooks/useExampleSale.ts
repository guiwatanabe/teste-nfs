import { useState } from 'react';
import api from '../utils/api';
import type { Sale } from '../types/sale';

const EXAMPLE_SALE: Partial<Sale> = {
  identification: 'Cliente Teste',
  cpf_cnpj: '111.444.777-35',
  municipal_state_registration: '123456789',
  address: 'Praça da Sé',
  address_number: '123',
  address_neighborhood: 'Sé',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01001-000',
  phone_number: '(11) 99999-9999',
  email: 'cliente@teste.com',
  amount: 15000,
  description: 'Serviço de consultoria',
};

export const useExampleSale = (onSuccess: () => Promise<void>) => {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleExampleSale = async (): Promise<void> => {
    setCreating(true);
    setCreateError(null);
    try {
      await api.post('/sales', EXAMPLE_SALE);
      await onSuccess();
    } catch {
      setCreateError('Failed to create example sale.');
    } finally {
      setCreating(false);
    }
  };

  return { creating, createError, handleExampleSale };
};
