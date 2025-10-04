# Portfolio Visualizer API Documentation

## Overview

The Portfolio Visualizer API provides endpoints for managing portfolios and assets. The API follows RESTful conventions and returns JSON responses.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. This will be implemented in future versions.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Success",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

## Endpoints

### Portfolios

#### GET /portfolios
Get all portfolios with optional pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort order ('ASC' or 'DESC', default: 'DESC')

**Example:**
```bash
GET /portfolios?page=1&limit=5&sortBy=name&sortOrder=ASC
```

#### GET /portfolios/:id
Get a specific portfolio by ID.

**Example:**
```bash
GET /portfolios/1
```

#### POST /portfolios
Create a new portfolio.

**Request Body:**
```json
{
  "name": "My Portfolio",
  "description": "Portfolio description"
}
```

#### PUT /portfolios/:id
Update a portfolio.

**Request Body:**
```json
{
  "name": "Updated Portfolio",
  "description": "Updated description"
}
```

#### DELETE /portfolios/:id
Delete a portfolio.

#### GET /portfolios/:id/performance
Get portfolio performance metrics.

#### GET /portfolios/statistics
Get overall portfolio statistics.

### Assets

#### GET /assets
Get all assets with optional pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `portfolioId` (number): Filter by portfolio ID
- `type` (string): Filter by asset type (STOCK, BOND, OPTION, CRYPTO)
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort order ('ASC' or 'DESC', default: 'DESC')

**Example:**
```bash
GET /assets?portfolioId=1&type=STOCK&page=1&limit=10
```

#### GET /assets/:id
Get a specific asset by ID.

#### POST /assets
Create a new asset.

**Request Body:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "type": "STOCK",
  "quantity": 100,
  "purchasePrice": 150.0,
  "currentPrice": 160.0,
  "purchaseDate": "2023-01-01",
  "portfolioId": 1
}
```

#### PUT /assets/:id
Update an asset.

**Request Body:**
```json
{
  "name": "Updated Asset Name",
  "quantity": 200,
  "currentPrice": 200.0
}
```

#### DELETE /assets/:id
Delete an asset.

#### GET /assets/search
Search assets by various criteria.

**Query Parameters:**
- `query` (string): Search query
- `fields` (string[]): Fields to search in (ticker, name, type)
- `portfolioId` (number): Filter by portfolio ID

**Example:**
```bash
GET /assets/search?query=AAPL&fields=ticker,name
```

#### GET /assets/performance
Get overall asset performance metrics.

#### GET /assets/statistics
Get asset statistics.

#### PUT /assets/:id/price
Update asset current price.

**Request Body:**
```json
{
  "currentPrice": 165.0
}
```

#### PUT /assets/prices/update-all
Update all asset prices from external APIs.

## Asset Types

### STOCK
Regular stock shares.

### BOND
Bonds with coupon rates and maturity dates.

### OPTION
Options with strike prices and expiration dates.

**Additional fields for options:**
- `optionType`: "CALL" or "PUT"
- `strikePrice`: Strike price
- `expirationDate`: Expiration date

### CRYPTO
Cryptocurrency assets.

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

## Examples

### Create Portfolio and Add Assets

1. Create a portfolio:
```bash
POST /portfolios
{
  "name": "Tech Stocks",
  "description": "Technology focused portfolio"
}
```

2. Add assets to the portfolio:
```bash
POST /assets
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "type": "STOCK",
  "quantity": 100,
  "purchasePrice": 150.0,
  "currentPrice": 160.0,
  "purchaseDate": "2023-01-01",
  "portfolioId": 1
}
```

3. Get portfolio performance:
```bash
GET /portfolios/1/performance
```

### Search and Filter Assets

1. Search for Apple stock:
```bash
GET /assets/search?query=Apple&fields=name,ticker
```

2. Get all stocks in a portfolio:
```bash
GET /assets?portfolioId=1&type=STOCK
```

3. Get paginated results:
```bash
GET /assets?page=1&limit=5&sortBy=purchaseDate&sortOrder=DESC
```
