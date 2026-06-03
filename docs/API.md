# 📚 API Reference - Ten Digital MZ

Base URL: `http://localhost:3000/api`

## Autenticação

Todas as rotas protegidas requerem JWT no header:
```
Authorization: Bearer {token}
```

### Register
**POST** `/auth/register`

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

Response:
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "_id": "user_id",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

### Login
**POST** `/auth/login`

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

Response: Mesmo do register

### Get User
**GET** `/auth/me`

Headers: `Authorization: Bearer {token}`

## Produtos

### List Produtos
**GET** `/produtos`

Query params:
- `category`: 'recarga', 'gift-card', 'streaming'
- `page`: número da página
- `limit`: itens por página

Response:
```json
[
  {
    "_id": "product_id",
    "name": "Netflix 1 Mês",
    "category": "streaming",
    "price": 250,
    "currency": "MZN",
    "description": "Acesso mensal"
  }
]
```

### Get Produto
**GET** `/produtos/{id}`

## Compras

### Criar Compra
**POST** `/purchases`

Headers: `Authorization: Bearer {token}`

```json
{
  "productId": "product_id",
  "quantity": 1,
  "paymentMethod": "stripe"
}
```

Response:
```json
{
  "_id": "purchase_id",
  "purchaseId": "TEN-2024-001",
  "totalAmount": 250,
  "paymentStatus": "pendente",
  "stripePaymentIntent": "pi_xxxxx"
}
```

### Minhas Compras
**GET** `/purchases/my-purchases`

Headers: `Authorization: Bearer {token}`

## Resgate de Códigos

### Resgatar Código
**POST** `/redeem`

Headers: `Authorization: Bearer {token}`

```json
{
  "code": "ABCD1234"
}
```

Response:
```json
{
  "success": true,
  "message": "Código resgatado com sucesso",
  "product": {
    "name": "Netflix 1 Mês",
    "category": "streaming"
  }
}
```

### Verificar Código (sem autenticação)
**POST** `/redeem/check`

```json
{
  "code": "ABCD1234"
}
```

Response:
```json
{
  "valid": true,
  "product": "Netflix 1 Mês"
}
```

## Chat IA

### Enviar Mensagem
**POST** `/chat`

Headers: `Authorization: Bearer {token}`

```json
{
  "message": "Como resgato um código?"
}
```

Response:
```json
{
  "reply": "Para resgatar um código, vá até a seção 'Resgate' no site..."
}
```

## Admin

### Criar Código de Resgate (Admin)
**POST** `/admin/redeem-codes`

Headers: `Authorization: Bearer {admin_token}`

```json
{
  "productId": "product_id",
  "quantity": 100,
  "expiresIn": 365
}
```

### Listar Vendas (Admin)
**GET** `/admin/sales`

Headers: `Authorization: Bearer {admin_token}`

Query params:
- `startDate`: data inicio
- `endDate`: data fim
- `status`: 'completo', 'pendente', 'falhou'

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## Webhooks (Stripe, etc)

```
POST /webhooks/stripe
POST /webhooks/paypal
```

Implementação em desenvolvimento.
