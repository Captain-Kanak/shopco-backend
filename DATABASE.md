# 🗄️ Database Schema

**[ERD LINK]()**

### User

| Field         | Description      |
| ------------- | ---------------- |
| id            | UUID (PK)        |
| name          | String           |
| email         | String (unique)  |
| emailVerified | Boolean (false)  |
| image         | String?          |
| address       | String?          |
| phone         | String?          |
| role          | UserRole         |
| status        | UserStatus       |
| date_of_birth | DateTime?        |
| createdAt     | DateTime (now()) |
| updatedAt     | DateTime         |
| deletedAt     | DateTime?        |

### Brand

| Field       | Description      |
| ----------- | ---------------- |
| id          | UUID (PK)        |
| name        | String           |
| logo        | String?          |
| description | String?          |
| createdAt   | DateTime (now()) |
| updatedAt   | DateTime         |
| deletedAt   | DateTime?        |

### Category

| Field       | Description      |
| ----------- | ---------------- |
| id          | UUID (PK)        |
| name        | String (unique)  |
| description | String?          |
| createdAt   | DateTime (now()) |
| updatedAt   | DateTime         |
| deletedAt   | DateTime?        |

### Product

| Field              | Description      |
| ------------------ | ---------------- |
| id                 | UUID (PK)        |
| title              | String           |
| slug               | String (unique)  |
| description        | String           |
| discountPercentage | Int              |
| brandId            | String (FK)      |
| categoryId         | String (FK)      |
| createdAt          | DateTime (now()) |
| updatedAt          | DateTime         |
| deletedAt          | DateTime?        |

### ProductColor

| Field     | Description      |
| --------- | ---------------- |
| id        | UUID (PK)        |
| imageUrl  | String           |
| color     | String           |
| productId | String (FK)      |
| createdAt | DateTime (now()) |
| updatedAt | DateTime         |
| deletedAt | DateTime?        |

### ProductVariant

| Field     | Description      |
| --------- | ---------------- |
| id        | UUID (PK)        |
| sku       | String (unique)  |
| stock     | Int              |
| price     | Decimal          |
| size      | ProductSize      |
| colorId   | String (FK)      |
| createdAt | DateTime (now()) |
| updatedAt | DateTime         |
| deletedAt | DateTime?        |

### Cart

| Field     | Description      |
| --------- | ---------------- |
| id        | UUID (PK)        |
| quantity  | Int              |
| userId    | String (FK)      |
| productId | String (FK)      |
| createdAt | DateTime (now()) |
| updatedAt | DateTime         |
| deletedAt | DateTime?        |

### Order

| Field           | Description      |
| --------------- | ---------------- |
| id              | UUID (PK)        |
| orderNumber     | String (unique)  |
| recipientName   | String           |
| shippingAddress | String           |
| phone           | String           |
| totalAmount     | Decimal          |
| discountAmount  | Decimal          |
| shippingCost    | Decimal          |
| orderStatus     | OrderStatus      |
| paymentStatus   | PaymentStatus    |
| userId          | String (FK)      |
| paidAt          | DateTime?        |
| shippedAt       | DateTime?        |
| deliveredAt     | DateTime?        |
| cancelledAt     | DateTime?        |
| createdAt       | DateTime (now()) |
| updatedAt       | DateTime         |
| deletedAt       | DateTime?        |

### OrderItem

| Field        | Description      |
| ------------ | ---------------- |
| id           | UUID (PK)        |
| sku          | String (unique)  |
| productTitle | String           |
| color        | String           |
| unitPrice    | Decimal          |
| quantity     | Int              |
| size         | ProductSize      |
| userId       | String (FK)      |
| variantId    | String (FK)      |
| createdAt    | DateTime (now()) |
| updatedAt    | DateTime         |
| deletedAt    | DateTime?        |

### Payment

| Field         | Description      |
| ------------- | ---------------- |
| id            | UUID (PK)        |
| amount        | Decimal          |
| transactionId | String?          |
| status        | PaymentStatus    |
| method        | PaymentMethod    |
| orderId       | String (FK)      |
| userId        | String (FK)      |
| createdAt     | DateTime (now()) |
| updatedAt     | DateTime         |
| deletedAt     | DateTime?        |
