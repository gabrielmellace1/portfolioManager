# Portfolio Visualizer Backend Architecture

## Overview

The Portfolio Visualizer backend is built using a layered architecture pattern with TypeScript, Express.js, TypeORM, and TSOA. The application follows clean architecture principles with clear separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────┐
│            Controllers              │
│         (API Endpoints)             │
├─────────────────────────────────────┤
│             Services                 │
│        (Business Logic)             │
├─────────────────────────────────────┤
│            Repositories              │
│         (Data Access)               │
├─────────────────────────────────────┤
│             Entities                 │
│        (Data Models)                 │
├─────────────────────────────────────┤
│            Database                  │
│         (SQLite/PostgreSQL)         │
└─────────────────────────────────────┘
```

## Core Components

### 1. Controllers Layer
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Request validation
  - Response formatting
  - Error handling
  - API documentation (TSOA decorators)

**Key Files:**
- `AssetController.ts` - Asset management endpoints
- `PortfolioController.ts` - Portfolio management endpoints

### 2. Services Layer
- **Purpose**: Implement business logic and orchestrate operations
- **Responsibilities**:
  - Business rule validation
  - Data transformation
  - Cross-cutting concerns (logging, performance monitoring)
  - Integration with external services

**Key Files:**
- `AssetService.ts` - Asset business logic
- `PortfolioService.ts` - Portfolio business logic
- `PriceService.ts` - External price data integration

### 3. Repositories Layer
- **Purpose**: Abstract data access and provide database operations
- **Responsibilities**:
  - Database queries
  - Data persistence
  - Query optimization
  - Data validation

**Key Files:**
- `AssetRepository.ts` - Asset data operations
- `PortfolioRepository.ts` - Portfolio data operations

### 4. Entities Layer
- **Purpose**: Define data models and database schema
- **Responsibilities**:
  - Data structure definition
  - Relationship mapping
  - Validation rules
  - Business logic methods

**Key Files:**
- `Asset.ts` - Asset entity with calculated properties
- `Portfolio.ts` - Portfolio entity with performance metrics

## Supporting Infrastructure

### Configuration Management
- **Location**: `src/config/`
- **Purpose**: Centralized application configuration
- **Files**:
  - `app.ts` - Application settings
  - `database.ts` - Database configuration

### Error Handling
- **Location**: `src/errors/`
- **Purpose**: Centralized error handling and custom error types
- **Files**:
  - `AppError.ts` - Custom error classes
  - `ErrorHandler.ts` - Global error handling middleware

### Middleware
- **Location**: `src/middleware/`
- **Purpose**: Cross-cutting concerns and request processing
- **Files**:
  - `RequestLogger.ts` - Request logging
  - `RateLimiter.ts` - API rate limiting
  - `Security.ts` - Security enhancements
  - `CORS.ts` - CORS configuration
  - `HealthCheck.ts` - Health check endpoints

### Utilities
- **Location**: `src/utils/`
- **Purpose**: Reusable utility functions
- **Files**:
  - `Logger.ts` - Structured logging
  - `ResponseHelper.ts` - Consistent API responses
  - `PerformanceMonitor.ts` - Performance tracking
  - `DateHelper.ts` - Date operations
  - `NumberHelper.ts` - Number operations
  - `StringHelper.ts` - String operations
  - `ValidationHelper.ts` - Validation utilities

### Validation
- **Location**: `src/validation/`
- **Purpose**: Input validation and DTOs
- **Files**:
  - `validators.ts` - DTOs and validation schemas
  - `ValidationMiddleware.ts` - Validation middleware

### Database Migrations
- **Location**: `src/migrations/`
- **Purpose**: Database schema management
- **Files**:
  - `001_initial_schema.sql` - Initial database schema
  - `002_add_performance_indexes.sql` - Performance indexes
  - `003_add_audit_tables.sql` - Audit tables
  - `004_add_performance_views.sql` - Performance views
  - `MigrationRunner.ts` - Migration execution

## Design Patterns

### 1. Repository Pattern
- **Purpose**: Abstract data access layer
- **Benefits**: Testability, maintainability, database independence
- **Implementation**: Each entity has a corresponding repository

### 2. Service Layer Pattern
- **Purpose**: Encapsulate business logic
- **Benefits**: Reusability, testability, separation of concerns
- **Implementation**: Services orchestrate repository operations

### 3. Dependency Injection
- **Purpose**: Loose coupling between components
- **Benefits**: Testability, flexibility, maintainability
- **Implementation**: Constructor injection in services and controllers

### 4. Factory Pattern
- **Purpose**: Create complex objects
- **Benefits**: Encapsulation, flexibility
- **Implementation**: Configuration factories for database and app setup

## Data Flow

### Request Processing Flow
```
1. HTTP Request → Express Router
2. Middleware (CORS, Security, Rate Limiting)
3. Controller (Request Validation)
4. Service (Business Logic)
5. Repository (Data Access)
6. Database (Data Persistence)
7. Response (JSON Format)
```

### Error Handling Flow
```
1. Error Occurs → Service/Repository
2. AppError Created → Service Layer
3. Error Handler → Global Middleware
4. Response Helper → Formatted Error Response
5. Logger → Error Logging
```

## Database Design

### Entity Relationships
```
Portfolio (1) ←→ (Many) Asset
```

### Key Features
- **Indexes**: Performance optimization for common queries
- **Constraints**: Data integrity enforcement
- **Calculated Properties**: Business logic in entities
- **Audit Trail**: Created/updated timestamps

## Security Features

### 1. Input Validation
- DTO validation with class-validator
- Type safety with TypeScript
- Sanitization of user input

### 2. Rate Limiting
- IP-based rate limiting
- Configurable limits and windows
- Graceful degradation

### 3. Security Headers
- Helmet.js for security headers
- CORS configuration
- Request size limits
- Content type validation

### 4. Error Handling
- No sensitive information in error responses
- Structured error logging
- Graceful error recovery

## Performance Optimizations

### 1. Database
- Strategic indexing
- Query optimization
- Connection pooling
- Migration management

### 2. Application
- Performance monitoring
- Structured logging
- Memory management
- Async/await patterns

### 3. API
- Response compression
- Pagination
- Caching strategies
- Rate limiting

## Testing Strategy

### 1. Unit Tests
- **Scope**: Individual functions and methods
- **Tools**: Jest, TypeScript
- **Coverage**: Utilities, services, entities

### 2. Integration Tests
- **Scope**: Component interactions
- **Tools**: Jest, Supertest
- **Coverage**: API endpoints, database operations

### 3. Test Structure
```
__tests__/
├── setup.ts              # Global test setup
├── utils/                 # Test utilities
│   ├── testHelpers.ts   # Test helper functions
│   └── testConfig.ts    # Test configuration
├── entities/             # Entity tests
├── services/             # Service tests
├── api/                  # API endpoint tests
└── scripts/              # Test execution scripts
```

## Deployment Considerations

### 1. Environment Configuration
- Environment-specific settings
- Secret management
- Database configuration
- External service integration

### 2. Database Migrations
- Automated migration execution
- Rollback capabilities
- Schema versioning
- Data integrity checks

### 3. Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Log aggregation

## Future Enhancements

### 1. Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- User management
- Session management

### 2. Caching
- Redis integration
- Query result caching
- Session caching
- Performance optimization

### 3. Real-time Features
- WebSocket integration
- Real-time price updates
- Live portfolio tracking
- Push notifications

### 4. Advanced Analytics
- Historical data analysis
- Performance benchmarking
- Risk assessment
- Portfolio optimization

## Development Guidelines

### 1. Code Organization
- Follow layered architecture
- Maintain separation of concerns
- Use dependency injection
- Implement proper error handling

### 2. Testing
- Write comprehensive tests
- Maintain high test coverage
- Use test-driven development
- Mock external dependencies

### 3. Documentation
- Keep API documentation updated
- Document business logic
- Maintain architecture documentation
- Use JSDoc comments

### 4. Performance
- Monitor application performance
- Optimize database queries
- Implement caching strategies
- Use async/await patterns
