

# Endpoins da Aplicação

## Endpoints

### Usuários
- **POST** `/people` — Criar usuário

### Autenticação
- **POST** `/login` — Login

### Contas
- **POST** `/accounts` — Criar conta
- **GET** `/accounts` — Listar contas
- **GET** `/accounts/{accountId}/balance` — Consultar saldo da conta

### Cartões
- **POST** `/accounts/{accountId}/cards` — Criar cartão
- **GET** `/accounts/{accountId}/cards` — Listar cartões da conta
- **GET** `/cards?itemsPerPage={itemsPerPage}&currentPage={currentPage}` — Listar cartões (paginação)

### Transações
- **POST** `/accounts/{accountId}/transactions` — Criar transação
- **GET** `/accounts/{accountId}/transactions` — Listar transações de uma conta
- **POST** `/accounts/{accountId}/transactions/internal` — Criar transação interna
- **POST** `/accounts/{accountId}/transactions/{transactionId}/revert` — Reverter transação

# Preencher as variáveis de ambiente

# Executar as migrations 
npx prisma generate

npx prisma migrate dev --name update-enum-CardType