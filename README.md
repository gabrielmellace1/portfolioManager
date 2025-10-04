# Portfolio Visualizer

A comprehensive portfolio management application with real-time price updates, built with React, TypeScript, Node.js, and WebSocket technology.

## 🚀 Features

### Real-time Price Updates
- **Automatic Updates**: Asset prices are updated every 30 seconds
- **WebSocket Communication**: Real-time price broadcasting to all connected clients
- **Live Price Display**: Visual indicators showing price changes with trending icons
- **Connection Status**: Real-time connection monitoring and error handling

### Portfolio Management
- **Multi-Portfolio Support**: Create and manage multiple investment portfolios
- **Asset Tracking**: Support for stocks, crypto, options, bonds, and cash
- **Performance Analytics**: Comprehensive P&L tracking and performance metrics
- **Visual Charts**: Interactive charts and graphs for portfolio analysis

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **RESTful API**: Comprehensive API with TSOA documentation
- **Database Integration**: SQLite database with TypeORM
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Performance Monitoring**: Built-in performance tracking and logging

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Express.js** with TSOA for API documentation
- **TypeORM** with SQLite database
- **Socket.IO** for WebSocket communication
- **Price Service** with multiple data sources (Alpha Vantage, Yahoo Finance)
- **Scheduler Service** for automatic price updates
- **Security Middleware** for request validation and protection

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time updates
- **Recharts** for data visualization
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=portfolio_db

# API Keys (Optional)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Usage

### Starting the Application

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on `http://localhost:3001`

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

### Real-time Price Updates

The system automatically:
- Updates all asset prices every 30 seconds
- Broadcasts price changes to all connected clients
- Shows real-time connection status
- Displays price change indicators with colors and icons

### API Endpoints

#### WebSocket Management
- `GET /api/websocket/status` - Get scheduler status
- `POST /api/websocket/scheduler/start` - Start price updates
- `POST /api/websocket/scheduler/stop` - Stop price updates
- `POST /api/websocket/scheduler/force-update` - Force immediate update

#### Portfolio Management
- `GET /api/portfolios` - Get all portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/:id` - Get portfolio by ID
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio

#### Asset Management
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create new asset
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/:id/update-price` - Update asset price
- `POST /api/assets/update-all-prices` - Update all prices

## 🛠️ Development

### Project Structure
```
portfolio-visualizer/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── entities/        # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

### Key Components

#### Backend Services
- **WebSocketService**: Manages WebSocket connections and broadcasting
- **PriceUpdateScheduler**: Handles automatic price updates every 30 seconds
- **AssetService**: Manages asset operations and price fetching
- **PortfolioService**: Handles portfolio management and calculations

#### Frontend Components
- **PriceUpdateDisplay**: Real-time price update visualization
- **useWebSocket**: React hook for WebSocket connection management
- **Dashboard**: Main dashboard with portfolio overview
- **PortfolioPage**: Individual portfolio management

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Request validation and sanitization
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization and output encoding

## 📊 Performance

- **Connection Pooling**: Database connection optimization
- **Caching**: Response caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Performance Monitoring**: Built-in performance tracking
- **Error Handling**: Comprehensive error handling and logging

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Monitoring

The application includes comprehensive monitoring:
- **Performance Metrics**: Request timing and database performance
- **Error Logging**: Detailed error tracking and reporting
- **Health Checks**: System health monitoring endpoints
- **WebSocket Status**: Real-time connection monitoring

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Support
The application can be containerized using Docker for easy deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/docs` when running the backend

## 🔄 Recent Updates

- ✅ Real-time WebSocket price updates every 30 seconds
- ✅ Comprehensive portfolio management
- ✅ Multi-asset type support (stocks, crypto, options, bonds, cash)
- ✅ Performance analytics and visualization
- ✅ Security middleware and validation
- ✅ TypeScript throughout the entire stack
- ✅ Responsive design for mobile and desktop

---

**Built with ❤️ using React, TypeScript, Node.js, and WebSocket technology**