# AdVantage - DSP Log Analytics Platform

AdVantage is a comprehensive analytics platform dedicated to extracting actionable insights from DSP bid and win logs. The platform provides programmatic advertisers with a deep understanding of their campaign performance through a unified, interactive dashboard experience.

## Features

- **User Authentication**: Secure login and registration system
- **Bid Efficiency Analysis**: Optimize bidding strategies with comprehensive analysis
- **Supply Path Optimization**: Identify and eliminate redundant supply paths
- **Hidden Fee Detection**: Uncover hidden fees in your supply chain
- **Interactive Dashboard**: Visualize insights through an elegant, user-friendly interface

## Technology Stack

- **Backend**: Go 1.23 with Gin web framework
- **Frontend**: Next.js 15 with React, TypeScript, and Tailwind CSS
- **Database**: PostgreSQL 16
- **Containerization**: Docker and Docker Compose
- **Development Workflow**: Makefile for easy commands

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Make

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/advantage.git
   cd advantage
   ```

2. Generate the package-lock.json file for the frontend:
   ```bash
   make gen-package-lock
   ```

3. Fix any Babel conflicts with Next.js:
   ```bash
   make fix-babel
   ```

4. Start the development environment:
   ```bash
   make dev
   ```

   This will:
   - Build the Docker containers
   - Start the backend, frontend, and PostgreSQL services
   - Set up the database with initial migrations

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Development Commands

#### Environment Management
- `make dev`: Build and start the development environment
- `make dev-down`: Stop the development environment
- `make restart-frontend`: Restart only the frontend container
- `make restart-backend`: Restart only the backend container
- `make restart-db`: Restart only the database container
- `make restart-all`: Restart all containers

#### Logging and Debugging
- `make logs`: View logs from all containers
- `make logs-frontend`: View only frontend logs
- `make logs-backend`: View only backend logs
- `make logs-db`: View only database logs

#### Frontend Development
- `make gen-package-lock`: Generate the package-lock.json file for the frontend
- `make fix-babel`: Fix Babel conflicts with Next.js
- `make rebuild-frontend`: Rebuild and restart the frontend container
- `make test-frontend`: Run frontend tests

#### Backend Development
- `make test-backend`: Run backend tests
- `make db-migrate`: Run database migrations
- `make db-seed`: Seed the database with initial data
- `make db-reset`: Reset the database

## Project Structure

```
advantage/
├── backend/               # Go backend
│   ├── cmd/               # Command-line applications
│   │   ├── server/        # Main server application
│   │   ├── migrate/       # Database migration tool
│   │   └── seed/          # Database seeding tool
│   ├── internal/          # Internal packages
│   │   ├── api/           # API handlers and routes
│   │   ├── config/        # Configuration
│   │   ├── db/            # Database connection
│   │   ├── models/        # Data models
│   │   └── services/      # Business logic
│   └── pkg/               # Public packages
├── frontend/              # Next.js frontend
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   │   ├── api.ts         # API client
│   │   └── auth/          # Authentication utilities
│   ├── public/            # Static assets
│   └── styles/            # CSS styles
├── infrastructure/        # Infrastructure configuration
│   ├── docker/            # Docker configuration
│   ├── fly/               # Fly.io deployment
│   └── vercel/            # Vercel deployment
└── scripts/               # Utility scripts
```

## Troubleshooting

### Common Issues

1. **CSS Build Errors**: If you see errors about Tailwind classes not existing, make sure the tailwind.config.js file is properly configured with the necessary theme extensions.

2. **TypeScript Errors**: If you encounter TypeScript errors, make sure you have the necessary type definitions installed.

3. **Docker Build Errors**: If Docker build fails, check the logs with `make logs-frontend` or `make logs-backend` to identify the issue.

4. **Next.js Font Errors**: If you see an error like "next/font requires SWC although Babel is being used", run `make fix-babel` to remove any conflicting Babel configurations.

5. **Container Communication**: If containers can't communicate with each other, check the network configuration in docker-compose.dev.yml.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created based on the AdVantage RFP requirements.
