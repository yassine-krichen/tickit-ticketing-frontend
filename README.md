# TickIT - Next Generation Ticketing System

<div align="center">
  <img src="src/assets/images/mini-logo.png" alt="TickIT Logo" width="120"/>
  
  **Advanced AI-Powered Ticketing System with Blockchain Integration**
  
  [![Angular](https://img.shields.io/badge/Angular-11.1.2-red.svg)](https://angular.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.1.2-blue.svg)](https://www.typescriptlang.org/)
  [![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
</div>

## 🚀 Overview

TickIT is a next-generation advanced ticketing system designed to streamline and enhance the Botool case processing workflow. Built with cutting-edge technologies including AI, blockchain, and advanced analytics, TickIT complements existing systems while providing powerful new capabilities for ticket management and workflow automation.

### Key Features

- 🤖 **AI-Powered Analytics** - Intelligent insights and recommendations
- 🔗 **Blockchain Integration** - Immutable timeline and audit trails
- 🔍 **Advanced Search & Filtering** - Sophisticated ticket discovery
- 📊 **Real-time Analytics Dashboard** - Comprehensive performance metrics
- 🔔 **Automated Notifications** - Real-time updates via WebSocket
- 📱 **Responsive Design** - Works on all devices
- 🎯 **Advanced Workflow Management** - Streamlined case processing

## 🏗️ Architecture

### Frontend Stack

- **Framework**: Angular 11.1.2
- **UI Library**: Bootstrap 5.3.3
- **Icons**: Font Awesome
- **Styling**: CSS3 with custom components
- **Authentication**: JWT with local storage
- **Real-time**: STOMP WebSocket integration

### Backend Integration

- **API**: Spring Boot REST services
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Real-time**: WebSocket/STOMP messaging

### Core Modules

```
src/app/
├── core/                    # Core services and utilities
│   ├── services/           # API services (Ticket, Auth, AI, etc.)
│   ├── models/             # TypeScript interfaces and models
│   ├── guards/             # Route guards and authentication
│   └── utils/              # Helper utilities
├── features/               # Feature modules
│   ├── auth/               # Authentication & login
│   ├── dashboard/          # Main dashboard with analytics
│   ├── ticket-details/     # Detailed ticket views
│   ├── ticket-create-update/ # Ticket creation/editing
│   ├── notifications/      # Notification center
│   └── ticket-activity/    # Activity timeline management
├── shared/                 # Shared components and utilities
└── assets/                # Static assets and translations
```

## 🎯 Main Features

### Dashboard

- **Multi-section Navigation**: Tickets, Analytics, AI Insights
- **Real-time KPI Cards**: Live statistics and metrics
- **Advanced Filtering**: Status, priority, date ranges, and more
- **Infinite Scrolling**: Optimized ticket loading
- **Bulk Operations**: Multi-ticket actions

### Ticket Management

- **Smart Creation**: AI-assisted ticket categorization
- **Rich Editor**: Detailed descriptions with formatting
- **Status Tracking**: Complete lifecycle management
- **Priority Systems**: P1-P5 priority levels
- **Assignment**: User and team assignment
- **SLA Tracking**: Response and resolution time monitoring

### Analytics & AI

- **Performance Metrics**: System-wide analytics
- **Trend Analysis**: Historical data insights
- **AI Recommendations**: Intelligent suggestions
- **Risk Assessment**: Proactive issue identification
- **Custom Reports**: Exportable analytics

### Activity Timeline

- **Blockchain-backed**: Immutable activity logs
- **Real-time Updates**: Live activity streaming
- **Rich Timeline**: Visual activity representation
- **Filtering & Search**: Advanced activity discovery
- **File Attachments**: Document management

## 🚀 Quick Start

### Prerequisites

- Node.js 12.16.3+
- Angular CLI 11.1.2
- Docker & Docker Compose (for containerized development)

### Local Development (Docker)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tickit-frontend
   ```

2. **Start development environment**

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the application**
   - Frontend: `http://localhost:4201`
   - The application will hot-reload on code changes

### Traditional Development Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm start
   # or
   ng serve
   ```

3. **Navigate to `http://localhost:4200`**

## 🔧 Configuration

### Environment Variables

The application uses environment-specific configurations:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080",
};
```

### Docker Configuration

For containerized development, environment variables can be configured in `docker-compose.dev.yml`:

```yaml
environment:
  - API_URL=http://localhost:8080
  - PRODUCTION=false
```

## 🏷️ Available Scripts

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `npm start`          | Start development server            |
| `npm run build`      | Build for production                |
| `npm run build:prod` | Production build with optimizations |
| `npm test`           | Run unit tests                      |
| `npm run lint`       | Lint code                           |
| `npm run e2e`        | Run end-to-end tests                |

## 🎨 Key Components

### Dashboard Components

- **Dashboard Content**: Main dashboard container with section navigation
- **KPIs Metrics**: Real-time statistics cards
- **Ticket Filters**: Advanced filtering interface
- **Ticket Item**: Individual ticket display component
- **Ticket Analytics**: AI-powered analytics dashboard

### Ticket Management

- **Ticket Details**: Comprehensive ticket view
- **Ticket Header**: Ticket metadata and actions
- **Activity Timeline**: Blockchain-backed activity log
- **Treatment Act**: Case processing workflow
- **AI Recommendations**: Intelligent suggestions

### Core Services

- **Ticket Service**: Complete ticket CRUD operations
- **AI Service**: Machine learning integrations
- **Auth Service**: JWT authentication
- **WebSocket Service**: Real-time notifications
- **Notification Service**: Alert management

## 🔒 Authentication

TickIT uses JWT-based authentication with local storage:

- **Login Process**: Credentials → JWT token → Local storage
- **Route Protection**: Auth guards on protected routes
- **Token Refresh**: Automatic token renewal
- **Logout**: Token cleanup and redirect

## 🌐 Internationalization

Multi-language support with dynamic switching:

- **English (EN)**: Default language
- **French (FR)**: Secondary language
- **Dynamic Loading**: Language files loaded on demand
- **User Preference**: Language selection persistence

## 🚢 Deployment

### Production Build

```bash
ng build --prod
```

### Docker Production

```bash
docker build -t tickit-frontend .
docker run -p 80:80 tickit-frontend
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### End-to-End Tests

```bash
npm run e2e
```

### Component Testing

Individual components can be tested using Angular Testing Utilities with Jasmine and Karma.

## 📊 Performance Features

- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Strategy**: Optimized change detection
- **Virtual Scrolling**: Efficient large list rendering
- **Caching**: API response caching
- **Minification**: Production code optimization
- **Tree Shaking**: Unused code elimination

## 🔧 Browser Support

TickIT runs on all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Development Guidelines

### Code Style

- Follow Angular Style Guide
- Use TypeScript strict mode
- Implement proper error handling
- Write meaningful component documentation

### Component Structure

```typescript
@Component({
  selector: "app-component-name",
  templateUrl: "./component-name.component.html",
  styleUrls: ["./component-name.component.css"],
})
export class ComponentNameComponent implements OnInit {
  // Properties
  // Constructor
  // Lifecycle hooks
  // Public methods
  // Private methods
}
```

## 🤝 Integration with Botool

TickIT is designed to complement the Botool system by:

- **Enhanced Workflow**: Streamlined case processing
- **Advanced Analytics**: Better insights into case patterns
- **Automation**: Reduced manual intervention
- **Audit Trail**: Blockchain-backed case history
- **Real-time Updates**: Immediate status notifications

## 📄 License

This project is proprietary software owned by [Company Name]. All rights reserved.

## 🆘 Support

For technical support or questions about TickIT:

- Check the troubleshooting section in `DOCKER_README.md`
- Review component documentation
- Contact the development team

---

<div align="center">
  <strong>TickIT - Revolutionizing Ticket Management</strong><br>
  Built with ❤️ using Angular, AI, and Blockchain Technology
</div>
