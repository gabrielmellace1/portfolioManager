# Portfolio Visualizer Backend Deployment Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite (development) or PostgreSQL (production)
- Git

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd portfolio-visualizer/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure:
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
```env
# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DB_TYPE=sqlite
DB_DATABASE=portfolio.db
# For PostgreSQL:
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
# DB_DATABASE=portfolio_db

# External APIs
YAHOO_FINANCE_API_KEY=your_yahoo_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
COINMARKETCAP_API_KEY=your_coinmarketcap_key
COINGECKO_API_KEY=your_coingecko_key

# Security
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Development Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Database Migrations
```bash
npm run migrate
```

### 3. Check Migration Status
```bash
npm run migrate:status
```

### 4. Run Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:entities
npm run test:services
npm run test:api

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 5. Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## Production Deployment

### 1. Build Application
```bash
npm run build
```

### 2. Install Production Dependencies
```bash
npm ci --only=production
```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Start Production Server
```bash
npm start
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_TYPE=postgres
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USERNAME=portfolio_user
      - DB_PASSWORD=portfolio_password
      - DB_DATABASE=portfolio_db
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=portfolio_user
      - POSTGRES_PASSWORD=portfolio_password
      - POSTGRES_DB=portfolio_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Clone and setup application
git clone <repository-url>
cd portfolio-visualizer/backend
npm install
npm run build
```

#### 2. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'portfolio-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

#### 3. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Heroku Deployment

#### 1. Create Heroku App
```bash
heroku create portfolio-backend-api
```

#### 2. Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set DB_TYPE=postgres
heroku config:set DB_HOST=your_db_host
heroku config:set DB_USERNAME=your_username
heroku config:set DB_PASSWORD=your_password
heroku config:set DB_DATABASE=your_database
```

#### 3. Deploy
```bash
git push heroku main
```

### Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Configure vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. Deploy
```bash
vercel --prod
```

## Database Setup

### SQLite (Development)
```bash
# Database file will be created automatically
# No additional setup required
```

### PostgreSQL (Production)

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

#### 2. Create Database
```sql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'portfolio_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
```

#### 3. Run Migrations
```bash
npm run migrate
```

## Monitoring and Logging

### 1. Health Checks
```bash
# Check application health
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/health/db
```

### 2. Log Monitoring
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

### 3. Performance Monitoring
```bash
# Monitor PM2 processes
pm2 monit

# View PM2 logs
pm2 logs portfolio-backend
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly
- Use environment-specific configurations

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access
- Regular security updates

### 3. Application Security
- Enable CORS properly
- Implement rate limiting
- Use HTTPS in production
- Regular dependency updates

### 4. Network Security
- Use firewalls
- Restrict port access
- Use VPN for database access
- Monitor network traffic

## Backup and Recovery

### 1. Database Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U portfolio_user portfolio_db > backup.sql

# Restore from backup
psql -h localhost -U portfolio_user portfolio_db < backup.sql
```

### 2. Application Backup
```bash
# Backup application files
tar -czf portfolio-backend-backup.tar.gz /path/to/application

# Backup logs
tar -czf logs-backup.tar.gz logs/
```

### 3. Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U portfolio_user portfolio_db > "backup_$DATE.sql"
find . -name "backup_*.sql" -mtime +7 -delete
```

## Troubleshooting

### 1. Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check database status
systemctl status postgresql

# Test connection
psql -h localhost -U portfolio_user -d portfolio_db
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Monitor Node.js memory
node --max-old-space-size=4096 dist/index.js
```

### 2. Log Analysis
```bash
# Search for errors
grep -i error logs/app.log

# Monitor real-time logs
tail -f logs/app.log | grep ERROR
```

### 3. Performance Issues
```bash
# Check CPU usage
top -p $(pgrep node)

# Monitor database queries
# Enable query logging in PostgreSQL
```

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancers
- Implement session management
- Use shared database
- Implement caching

### 2. Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement connection pooling
- Use CDN for static assets

### 3. Database Scaling
- Read replicas
- Database sharding
- Connection pooling
- Query optimization

## Maintenance

### 1. Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 2. Database Maintenance
```bash
# Run database migrations
npm run migrate

# Check migration status
npm run migrate:status

# Optimize database
VACUUM ANALYZE;
```

### 3. Log Rotation
```bash
# Setup log rotation
# Add to /etc/logrotate.d/portfolio-backend
/path/to/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 node node
}
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review security settings
5. Check system resources

Contact the development team for additional support.
