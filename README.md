# teste-nfs

## Requisitos

- Docker
- GNU make (Windows: Git Bash ou WSL)

## Rodando a aplicação

- Clone o repositório
- `make setup`
- A aplicação estará disponível na porta 4173 (`http://localhost:4173/`).

## Serviços

- frontend (porta 4173)
- api (porta 3000)
- prefeitura-mock (porta 3001)
- worker
- db - PostgreSQL (porta 5432)
- redis (porta 6379)

## Variáveis de Ambiente

Verificar o arquivo `.env.example`.

## Usuário Padrão

Usuário padrão para demonstração - admin/admin.

## Endpoints (API)

#### Certificados

- GET /certificate - retorna informações do certificado do usuário autenticado
- POST /certificate - salva certificado para o usuário autenticado
  - certificate_file: file
  - certificate_password: string

#### Vendas

- GET /sales - retorna vendas para o usuário autenticado
- POST /sales - insere uma venda para geração da nfs
  - identification: string
  - cpf_cnpj: string
  - municipal_state_registration: string
  - address: string
  - phone_number: string
  - email: string
  - amount: number - _em centavos_
  - description: string

#### Autenticação

- GET /auth/user - retorna informações do usuário autenticado
- POST /auth/login - autentica o usuário
  - username: string
  - password: string
- POST /auth/logout - invalida o cookie e desloga o usuário

## Decisões

### Backend

- Node.js + TypeScript
- Fastify
- Drizzle-ORM + PostgreSQL
- BullMQ + Redis

| Camada         | Arquivo           | Responsabilidade                          |
| -------------- | ----------------- | ----------------------------------------- |
| **controller** | `*.controller.ts` | Definição de rotas, validação, resposta   |
| **service**    | `*.service.ts`    | Regras de negócio, lógica, acesso a dados |
| **model**      | `*.model.ts`      | Modelos tipados através do schema do DB   |

### Frontend

- Vite + React
- React-Router
- Axios
- Tailwind

### Testes

Testes unitários e de integração para o backend utilizando **Vitest**. A estrutura de testes espelha `src/`, e cobre controllers, services, middleware e conexão com o db.

Para rodar: `npm run test`
