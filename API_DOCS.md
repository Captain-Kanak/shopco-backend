# API Documentation

**Project:** shopco-backend

**Base URL:** `https://shopco.com/api/v1`

**Version:** v1

---

## Authentication

Authentication is managed by [Better Auth](https://better-auth.com). Session tokens are issued on login/registration and must be sent with every request to a **SECURE** or **ADMIN** endpoint.

| Access Level | Meaning                                                        |
| ------------ | -------------------------------------------------------------- |
| `PUBLIC`     | No authentication required.                                    |
| `SECURE`     | Requires a valid, authenticated session (any role).            |
| `ADMIN`      | Requires a valid, authenticated session **and** `role: ADMIN`. |

---

## Response Format

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { ... }
}
```

---

## Common Query Parameters (List Endpoints)

Every `GET` "list" endpoint (`/users`, `/products`, `/brands`, etc.) supports the same set of query parameters, backed by a shared query-builder utility:

| Parameter             | Type                     | Description                                                                                                                               |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `page`                | number                   | Page number. Defaults to `1`.                                                                                                             |
| `limit`               | number                   | Results per page. Defaults to `10`, capped at `100`.                                                                                      |
| `searchTerm`          | string                   | Free-text search across that resource's searchable fields.                                                                                |
| `sortBy`              | string                   | Field to sort by. Falls back to `createdAt` if the field isn't sortable.                                                                  |
| `sortOrder`           | `asc` \| `desc`          | Sort direction. Defaults to `desc`.                                                                                                       |
| `selectFields`        | string (comma-separated) | Restrict the response to specific fields, e.g. `?selectFields=id,name,email`. Fields not permitted for the resource are silently omitted. |
| `includeFields`       | string (comma-separated) | Attach specific relations, e.g. `?includeFields=orders`. Relations not permitted for the resource are silently omitted.                   |
| _(resource-specific)_ | varies                   | Any field listed as filterable for that resource, e.g. `?role=ADMIN`, `?price[gte]=100&price[lte]=500`.                                   |

List responses include pagination metadata:

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "data": [ ... ],
    "meta": {
      "currentPage": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
}
```

---

## Table of Contents

- [Authentication](#authentication-endpoints)
- [User](#user)
- [Brand](#brand)
- [Category](#category)
- [Product](#product)
- [Cart](#cart)
- [Order](#order)
- [Payment](#payment)
- [Notes & Open Questions](#notes--open-questions)

---

## Authentication Endpoints

> Managed by Better Auth. Registration/login issue a session token; all subsequent SECURE/ADMIN requests must include it.

| Method | Endpoint             | Access | Description                                            |
| ------ | -------------------- | ------ | ------------------------------------------------------ |
| `POST` | `/auth/register`     | PUBLIC | Register a new account.                                |
| `POST` | `/auth/verify-email` | PUBLIC | Verify a user's email via the otp sent to their inbox. |
| `POST` | `/auth/login`        | PUBLIC | Log in with email/password.                            |
| `GET`  | `/auth/login/google` | PUBLIC | Initiate Google OAuth login.                           |
| `GET`  | `/auth/me`           | SECURE | Get the currently authenticated user's data.           |

---

## User

| Method   | Endpoint         | Access | Description                                                                                                          |
| -------- | ---------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `PATCH`  | `/users/me`      | SECURE | Update the caller's own profile (`name`, `phone`, `address`, `dateOfBirth`, `image`). Accepts `multipart/form-data`. |
| `GET`    | `/users`         | ADMIN  | List all users. Supports [common query parameters](#common-query-parameters-list-endpoints).                         |
| `GET`    | `/users/:id`     | ADMIN  | Get a single user by ID.                                                                                             |
| `PATCH`  | `/users/:id/ban` | ADMIN  | Ban a user (`status → BANNED`).                                                                                      |
| `DELETE` | `/users/:id`     | ADMIN  | Soft-delete a user (`deletedAt` set).                                                                                |

**Filterable fields:** `role`, `status`, `emailVerified`
**Searchable fields:** `name`, `email`, `phone`

---

## Brand

| Method   | Endpoint      | Access | Description                                                                                   |
| -------- | ------------- | ------ | --------------------------------------------------------------------------------------------- |
| `POST`   | `/brands`     | ADMIN  | Create a new brand.                                                                           |
| `GET`    | `/brands`     | PUBLIC | List all brands. Supports [common query parameters](#common-query-parameters-list-endpoints). |
| `GET`    | `/brands/:id` | PUBLIC | Get a single brand by ID.                                                                     |
| `PATCH`  | `/brands/:id` | ADMIN  | Update a brand by ID.                                                                         |
| `DELETE` | `/brands/:id` | ADMIN  | Soft-delete a brand by ID.                                                                    |

---

## Category

| Method   | Endpoint          | Access | Description                                                                                       |
| -------- | ----------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `POST`   | `/categories`     | ADMIN  | Create a new category (optionally nested via `parentId`).                                         |
| `GET`    | `/categories`     | PUBLIC | List all categories. Supports [common query parameters](#common-query-parameters-list-endpoints). |
| `GET`    | `/categories/:id` | PUBLIC | Get a single category by ID.                                                                      |
| `PATCH`  | `/categories/:id` | ADMIN  | Update a category by ID.                                                                          |
| `DELETE` | `/categories/:id` | ADMIN  | Soft-delete a category by ID.                                                                     |

---

## Product

| Method   | Endpoint        | Access | Description                                                                                     |
| -------- | --------------- | ------ | ----------------------------------------------------------------------------------------------- |
| `POST`   | `/products`     | ADMIN  | Create a new product, including variants, attributes, and images.                               |
| `GET`    | `/products`     | PUBLIC | List all products. Supports [common query parameters](#common-query-parameters-list-endpoints). |
| `GET`    | `/products/:id` | PUBLIC | Get a single product by ID, with variants/images.                                               |
| `PATCH`  | `/products/:id` | ADMIN  | Update a product by ID.                                                                         |
| `DELETE` | `/products/:id` | ADMIN  | Soft-delete a product by ID.                                                                    |

**Filterable fields:** `status`, `brandId`, `price` _(range)_, `stock` _(range)_
**Searchable fields:** `title`, `description`
**Numeric fields:** `price`, `stock`

> ⚠️ Public `GET /products` and `GET /products/:id` should force `status: ACTIVE` in the query regardless of any `status` filter the client sends — see [Notes](#notes--open-questions).

---

## Cart

| Method   | Endpoint     | Access | Description                                |
| -------- | ------------ | ------ | ------------------------------------------ |
| `POST`   | `/carts`     | SECURE | Add an item to the caller's own cart.      |
| `GET`    | `/carts`     | SECURE | Get the **caller's own** cart items.       |
| `PATCH`  | `/carts/:id` | SECURE | Update cart items quantity.                |
| `DELETE` | `/carts/:id` | SECURE | Remove an item from the caller's own cart. |

> ⚠️ "Get all carts" here means the authenticated user's own cart, not every user's cart — see [Notes](#notes--open-questions) for the access-scoping this implies.

---

## Order

| Method   | Endpoint      | Access   | Description                                                 |
| -------- | ------------- | -------- | ----------------------------------------------------------- |
| `POST`   | `/orders`     | SECURE   | Create a new order from the caller's cart.                  |
| `GET`    | `/orders`     | SECURE   | Get the **caller's own** orders (or all orders, for ADMIN). |
| `GET`    | `/orders/:id` | SECURE   | Get a single order by ID (owner or ADMIN only).             |
| `PATCH`  | `/orders/:id` | SECURE\* | Update order status/details.                                |
| `DELETE` | `/orders/:id` | SECURE\* | Cancel/remove an order.                                     |

**\*See [Notes](#notes--open-questions)** — `PATCH`/`DELETE` likely need role-based restrictions rather than a flat SECURE, since a customer should not be able to arbitrarily change `orderStatus` to `DELIVERED` or hard/soft-delete a fulfilled order.

---

## Payment

| Method   | Endpoint            | Access   | Description                                                                                                                                                                                         |
| -------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/payments/intent`  | SECURE   | Create a Stripe payment intent for an order.                                                                                                                                                        |
| `GET`    | `/payments`         | SECURE   | Get the **caller's own** payments (or all, for ADMIN).                                                                                                                                              |
| `GET`    | `/payments/:id`     | SECURE   | Get a single payment by ID (owner or ADMIN only).                                                                                                                                                   |
| `DELETE` | `/payments/:id`     | SECURE\* | Delete a payment record.                                                                                                                                                                            |
| `POST`   | `/payments/webhook` | WEBHOOK  | Stripe webhook — confirms payment success/failure and updates `Payment.status` / `Order.paymentStatus` server-to-server. Not user-facing; verified via Stripe's signing secret, not a user session. |

**\*See [Notes](#notes--open-questions)** — allowing any authenticated user to `DELETE` a payment record is almost certainly unintended.

Payment confirmation flow: the client calls `POST /payments/create-payment-intent` to get a Stripe client secret, completes payment on the client side via Stripe.js, and Stripe then calls the `/payments/webhook` endpoint server-to-server to confirm success/failure — the frontend itself never directly tells your backend "payment succeeded."

---

## Notes & Open Questions

These are flagged deliberately rather than silently corrected, since they're access-control decisions worth confirming rather than assuming:

1. **`GET /carts` and `GET /orders`/`GET /payments` say "get all"** — for a non-admin `SECURE` route, this should mean "get the caller's own records" (scoped by `userId` via a hardcoded `.where({ userId: req.user.id })`, not a client-controlled filter). Worth confirming the service layer enforces this and doesn't allow `?userId=someone-else` to leak other users' data. If `ADMIN` should also be able to list _all_ orders/payments, that likely needs to be a role-based branch in the same route rather than assumed from a single `SECURE` label.
2. **`PATCH /orders/:id` and `DELETE /orders/:id` as `SECURE`** — a customer should probably only be able to _cancel_ their own pending order (a constrained action), not freely `PATCH` any field including `orderStatus`, `paymentStatus`, or shipping timestamps. Consider splitting this into a narrower customer-facing `PATCH /orders/:id/cancel` and a separate `ADMIN`-only `PATCH /orders/:id` for full status management.
3. **`DELETE /payments/:id` as `SECURE`** — deleting a payment record is a sensitive financial operation; likely should be `ADMIN`-only, or removed entirely in favor of a refund flow that updates `PaymentStatus` rather than deleting the row.
4. **Public product listing should force `status: ACTIVE`** — since `Product.status` includes `DRAFT` and `ARCHIVED`, the public `GET /products` route must hardcode this in `.where()` rather than exposing `status` as a client-controllable filter on that specific route (an `ADMIN`-only products endpoint could safely allow filtering by any status).
5. **Stripe webhook route** was implied but not explicitly listed in the original endpoint table — added here since payment confirmation depends on it and it has fundamentally different auth (signature verification, not session-based) from every other route in this document.
