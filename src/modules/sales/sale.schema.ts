const saleSchema = {
  type: 'object',
  properties: {
    identification: { type: 'string', maxLength: 255 },
    cpf_cnpj: { type: 'string', maxLength: 20 },
    municipal_state_registration: { type: 'string', maxLength: 50 },
    address: { type: 'string', maxLength: 255 },
    phone_number: { type: 'string', maxLength: 20 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    amount: { type: 'number' },
    description: { type: 'string', maxLength: 255 },
  },
  required: [
    'identification',
    'cpf_cnpj',
    'municipal_state_registration',
    'address',
    'phone_number',
    'email',
    'amount',
    'description',
  ],
};

export default saleSchema;
