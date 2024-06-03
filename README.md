# E-commerce REST API
This API is part of a Portfolio Project on Codecademy's **Full Stack Engineer** career path.

## ENDPOINTS

PRODUCTS
- GET /products - [√]
- GET /products?category={categoryId} - [√]
- GET /products/{productId} - [√]

PRODUCTS (auth)
- POST /products - [√]
- PUT /products/{productId} - [√]
- DELETE /products/{productId} - [√]

USERS
- POST /users/register - [√]
- POST /users/login - [√]
- POST /users/logout - [√]

USERS (auth)
- GET /users - [√]
- GET /users/{userId} - [√]
- PUT /users/{userId} - [√]
- DELETE /users/{userId} - [√]

CHECKOUT (auth)
- POST /cart/{cartId}/checkout - [√]

CART
- GET /cart - [√]
- POST /cart - [√]
- POST /cart/{cartId} - [√]
- GET /cart/{cartId} - [√]
- DELETE /cart/{cartId} - [√]

ORDERS (auth)
- GET /orders - [√]
- POST /orders - [√]
- GET /orders/{orderId} - [√]
- PUT /orders/{orderId} - [√]
- DELETE /orders/{orderId} - [√]
