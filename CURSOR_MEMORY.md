# AdVantage Project - Development Notes

This document contains important lessons, principles, and notes about the AdVantage project to help guide future development sessions.

## Project Overview

AdVantage is a comprehensive DSP Log Analytics Platform designed to extract actionable insights from bid and win logs. The project follows a three-layer architecture:

1. **Data Ingestion Layer** - For processing high-volume DSP bid and win logs
2. **Analytics Engine** - For comprehensive log analysis with modular diagnostic components
3. **Presentation Layer** - For visualizing insights through a centralized dashboard

## Technology Stack

- **Backend**: Go 1.23 with Gin web framework
- **Frontend**: Next.js 15 with React, TypeScript, and Tailwind CSS
- **Database**: PostgreSQL 16
- **Containerization**: Docker and Docker Compose

## Development Status

### Completed
- Initial project structure setup for backend and frontend
- Docker containerization with hot-reloading for development
- Makefile with common development commands
- Backend API endpoints for authentication and user management
- Frontend UI components for home, login, register, and dashboard pages
- JWT-based authentication system
- Frontend API client for backend communication
- Authentication context provider for state management
- Protected route component for secured routes
- Added logging commands to Makefile
- Fixed Tailwind CSS configuration for proper styling
- Resolved font loading and Babel conflicts in Next.js
- Added container restart commands to Makefile
- Added scripts for fixing common frontend issues
- Fixed API client configuration to properly address backend endpoints
- Added CORS middleware to handle preflight requests
- Ran database migrations to create necessary tables for user authentication
- Implemented user registration and authentication flow
- Enhanced dashboard UI with responsive sidebar navigation
- Created dashboard overview page with analytics modules based on RFP
- Implemented end-to-end file upload functionality for DSP logs
- Connected frontend file upload UI to backend API
- Created analytics visualization page with interactive filters and chart placeholders
- Implemented mock data visualization for bid performance metrics
- Added responsive UI components for data filtering and visualization
- Created comprehensive .gitignore setup for initial commit
- Fixed TypeScript typing issues in analytics page components
- Implemented interactive charts using Recharts library for data visualization

### In Progress
- Backend and frontend integration testing
- Database seeding scripts
- UI polishing and responsiveness testing
- Integration of real-time data with visualization components
- DSP log file processing and analysis implementation
- Implementation of advanced analytics modules based on RFP requirements

### Next Steps
- Connect the analytics visualizations to actual data from uploaded DSP logs
- Implement proper file validation and content verification
- Enhance data filtering capabilities with more granular options
- Add more chart types and visualization options
- Improve error handling with user-friendly messages for API requests
- Implement persistent sessions with proper token refresh mechanisms
- Create additional middleware for the backend API to validate requests
- Develop the remaining analytics modules as per the RFP requirements

## Lessons Learned

1. **Docker Configuration**:
   - Using `npm ci` requires a package-lock.json file, while `npm install` is more forgiving but less deterministic
   - The Air package for Go hot reloading should be specified as `github.com/cosmtrek/air`

2. **Authentication Flow**:
   - Using a centralized auth context provider simplifies state management across components
   - Protected route components can elegantly handle access control to authenticated routes
   - JWT tokens should be stored securely and managed through a single interface
   - User authentication requires coordination between frontend forms, API client configuration, backend CORS settings, and database schemas

3. **Next.js and TypeScript**:
   - Next.js 15 uses the App Router by default, which requires 'use client' directives for client components
   - TypeScript configuration needs proper setup (tsconfig.json) to avoid type errors
   - React 18 with Next.js requires proper typing for components and hooks
   - Downlevel iteration issues may arise when using certain ES6+ features like `array.entries()` in for...of loops

4. **Tailwind CSS Configuration**:
   - Custom CSS properties (CSS variables) need to be properly mapped in the Tailwind configuration
   - Using `@apply border-border` requires defining the border color utility in the Tailwind config
   - When seeing "The class does not exist" errors, check your theme extension in tailwind.config.js

5. **Next.js Font Configuration**:
   - Next.js 15 uses SWC (a Rust-based compiler) by default for better performance
   - Custom Babel configurations (.babelrc) can conflict with Next.js font loading
   - Use the Inter font through standard CSS imports rather than Next.js font loading when using custom Babel configs
   - The error "next/font requires SWC although Babel is being used" indicates this conflict

6. **API Configuration**:
   - When using Axios baseURL with API path prefixes (like '/api/v1'), endpoint paths in API method calls should be relative to that base
   - If the baseURL includes '/api/v1', then endpoint paths should not repeat that prefix
   - For proper CORS and preflight requests, ensure your backend API is correctly configured to handle OPTIONS requests
   - Always check both frontend console and backend logs to debug API connectivity issues

7. **Database Setup**:
   - Always run migrations before testing user authentication flows
   - The migration system should use "CREATE TABLE IF NOT EXISTS" to avoid errors when running migrations multiple times
   - Check database logs for SQL errors when troubleshooting backend 500 errors
   - PostgreSQL error "relation does not exist" indicates missing database tables that need to be created via migrations

8. **Full-Stack Integration**:
   - Troubleshooting authentication requires checking each layer of the stack: frontend forms, API client, network requests, backend handlers, and database operations
   - End-to-end testing of authentication flows should be done after any changes to API endpoints, CORS configuration, or database schema
   - Dashboard implementation should begin after authentication is stable, as it builds upon authenticated user sessions

9. **Dashboard UI Development**:
   - Implementing a responsive sidebar with navigation improves user experience across devices
   - Using placeholders for analytics data allows UI development to proceed without backend implementation
   - Organizing dashboard sections according to the RFP requirements helps ensure alignment with project goals
   - File upload UI with drag-and-drop functionality enhances user experience for log data ingestion
   - Using Framer Motion for animations creates a more premium feel in the UI

10. **File Upload Implementation**:
    - Separating file storage from file processing logic promotes modular design
    - Using a service-based architecture allows for clear separation of concerns
    - Implementing proper file validation on both client and server prevents security issues
    - Asynchronous file processing prevents blocking the main thread during long operations
    - Tracking upload progress enhances user experience for large file uploads

## Development Principles

### Backend Development

1. **Modular Architecture**: Keep components modular and focused on single responsibilities.
2. **Error Handling**: Implement comprehensive error handling with appropriate HTTP status codes.
3. **Validation**: Validate all input data at the API boundary.
4. **Database Access**: Use prepared statements and parameterized queries to prevent SQL injection.
5. **Authentication**: JWT-based authentication with proper token validation.

### Frontend Development

1. **Component Structure**: Create reusable components with clear interfaces.
2. **State Management**: Use React hooks for local state and context for global state.
3. **Form Handling**: Implement form validation with react-hook-form.
4. **Animations**: Use Framer Motion for smooth, performant animations.
5. **Responsive Design**: Ensure all UI components work well on different screen sizes.
6. **CSS Methodology**: Use Tailwind utility classes consistently and configure theme extensions properly.

### Development Workflow

1. **Docker-First**: Always develop using the containerized environment for consistency.
2. **Database Migrations**: Create proper migrations for all database schema changes.
3. **Testing**: Write tests for critical functionality.
4. **Documentation**: Keep documentation up-to-date with code changes.
5. **Logging**: Use the new logging commands to debug issues in the containers.
6. **Automation**: Create scripts to automate common tasks and fixes.

## Phase 1 Implementation Notes

Phase 1 focuses on setting up the development environment and implementing the authentication system:

1. **Development Environment**: Docker-based with hot-reloading for both frontend and backend.
2. **Authentication System**: JWT-based with secure password hashing.
3. **User Management**: Registration, login, and profile management.
4. **UI/UX**: Modern, responsive design with animations for a premium feel.
5. **Dashboard Structure**: Layout with sidebar navigation, overview dashboard, and file upload interface.
6. **File Upload System**: End-to-end file upload with storage, validation, and basic processing.

### Common Issues and Solutions

- **Docker Build Error**: The frontend Docker build was failing because `npm ci` requires a package-lock.json file. Fixed by changing to `npm install` in the Dockerfile.
- **Air Package Name**: Fixed incorrect air package name from `air-verse/air` to `cosmtrek/air`.
- **TypeScript Errors**: The frontend has TypeScript errors that need to be resolved by installing proper type definitions.
- **Authentication Context**: Implemented a centralized auth context to manage user state across the application.
- **Tailwind CSS Errors**: Fixed the `border-border` class error by properly configuring the borderColor theme in tailwind.config.js.
- **Next.js Font Errors**: Fixed font loading issues by removing the Next.js font loader and using standard CSS imports instead.
- **Babel Conflicts**: Created a script to detect and remove any Babel configuration files that conflict with Next.js.
- **API Client Configuration**: Fixed issues with API endpoint paths by ensuring the baseURL is set correctly and endpoint paths are properly structured relative to the baseURL.
- **Database Migration**: Fixed 500 error on user registration by running database migrations to create the required users table.
- **Authentication Flow**: Successfully implemented full registration and login flow after fixing API paths, CORS issues, and database migrations.
- **Dashboard Implementation**: Created a responsive dashboard layout with sidebar navigation and analytics modules based on the RFP requirements.
- **File Upload System**: Implemented file upload functionality with backend storage, validation, and basic processing.

## Future Considerations

### Analytics Modules (As outlined in RFP)

1. **Bid Efficiency & Shading Optimization**:
   - Analyze bid request and win logs to identify optimal bidding patterns
   - Implement adaptive bid shading based on historical win rates

2. **Supply Path Duplication Detection**:
   - Graph-based analysis using directed acyclic graphs (DAGs) to model supply paths
   - Calculate path similarity to identify redundant paths

3. **Hidden Fee Identification**:
   - Statistical variance analysis between bid prices and clearing prices
   - Anomaly detection to identify unusual fee patterns

4. **Frequency Management Analysis**:
   - User-level frequency distribution analysis
   - Fatigue curve modeling using exponential decay functions

5. **Fraud and Viewability Diagnostics**:
   - Pattern recognition using machine learning models
   - IP geolocation clustering for traffic origin analysis

6. **Creative Effectiveness Scoring**:
   - Multi-factor performance analysis algorithm
   - A/B testing statistical significance calculator

7. **Privacy-compliance Health Check**:
   - Rule-based compliance checking engine
   - PII detection and risk scoring

8. **SSP Redundancy Analysis**:
   - Network analysis algorithm for supply path mapping
   - Path efficiency scoring algorithm

9. **Inventory Quality Scoring**:
   - Multi-dimensional quality evaluation
   - Weighted quality index calculation

10. **Audience Saturation Alerts**:
    - Performance degradation detection
    - Early warning system for audience saturation

### Additional Considerations

1. **Data Visualization**: Add interactive charts and graphs for data visualization.
2. **Performance Optimization**: Implement caching and query optimization for large datasets.
3. **Deployment**: Set up CI/CD pipelines for automated testing and deployment.
4. **Scalability**: Design the system to handle increasing volumes of log data.
5. **Security**: Implement comprehensive security measures for user data and log files.
6. **Reporting**: Create exportable reports for key insights and metrics.
7. **Collaboration**: Add sharing and collaboration features for team-based analysis.

## Troubleshooting

### Common Issues

1. **Docker Networking**: If services can't communicate, check the network configuration in docker-compose.yml.
2. **Database Connections**: Ensure the database connection string is correct and the database is running.
3. **JWT Authentication**: Check token expiration and signing method if authentication fails.
4. **Frontend Build Errors**: Run `npm run build` to check for build-time errors.
5. **TypeScript Errors**: Install missing type definitions with `npm install --save-dev @types/package-name`.
6. **Tailwind CSS Errors**: Check tailwind.config.js when you see "The class does not exist" errors.
7. **Next.js Font Errors**: If you see "next/font requires SWC although Babel is being used", remove any .babelrc files or use traditional CSS imports for fonts.
8. **API Endpoint Errors**: If you see 404 errors on API calls, check that the frontend API client is using the correct base URL and path structure.
9. **Database Migration Errors**: If you see "relation does not exist" errors in PostgreSQL logs, you need to run database migrations to create the required tables.
10. **Component Type Errors**: When using libraries like Framer Motion with TypeScript, ensure proper type definitions are installed and component props match expected types.
11. **File Upload Issues**: If file uploads fail, check multipart form configuration, max file size settings, and storage permissions.

### Useful Commands

- `make dev`: Start the development environment
- `make dev-down`: Stop the development environment
- `make restart-frontend`: Restart only the frontend container
- `make restart-backend`: Restart only the backend container
- `make restart-db`: Restart only the database container
- `make restart-all`: Restart all containers
- `make logs`: View logs from all containers
- `make logs-frontend`: View only frontend logs
- `make logs-backend`: View only backend logs
- `make logs-db`: View only database logs
- `make fix-babel`: Fix Babel conflicts with Next.js
- `make rebuild-frontend`: Rebuild and restart the frontend container
- `make db-migrate`: Run database migrations
- `make db-seed`: Seed the database with initial data

## Analytics Implementation Notes

The analytics page implementation includes several key components:

1. **Interactive Filters**: Users can filter data by time range, campaign, and metrics to customize their view.

2. **Performance Trends**: A placeholder for chart visualizations that will display selected metrics over time.

3. **Campaign Comparison**: An interactive component that allows users to compare different metrics across campaigns with visual bar charts.

4. **Metrics Summary**: Key performance indicators for bid performance and win rates are displayed in an easy-to-read format.

5. **Data Grid**: A sortable and paginated table that displays detailed bid history data.

6. **Optimization Recommendations**: AI-generated recommendations based on the analyzed data to help optimize campaign performance.

The implementation uses mock data for the initial phase, with the intention to connect to real DSP log data in future iterations. The UI is designed to be responsive and user-friendly, with smooth animations and intuitive controls.

Future enhancements will include:
- Integration with real-time data from uploaded DSP logs
- Advanced chart visualizations using D3.js or Chart.js
- Export functionality for reports and data
- Drill-down capabilities for deeper analysis
- Custom alert thresholds for key metrics

## Git and Project Setup Notes

The project has been configured with appropriate .gitignore files to ensure a clean repository:

1. **Root .gitignore**: Covers general patterns for both frontend and backend, including:
   - Dependencies (node_modules, vendor)
   - Build artifacts (dist, build, out, .next)
   - Environment files (.env*)
   - Logs (*.log)
   - IDE files (.idea, .vscode)
   - Data files (*.csv, *.tsv, *.json) with exceptions for configurations and fixtures

2. **Frontend-specific .gitignore**: Addresses Next.js and React-specific patterns:
   - Next.js build artifacts (.next, out)
   - TypeScript files (*.tsbuildinfo)
   - Tailwind and ESLint cache files
   - Testing artifacts

3. **Backend-specific .gitignore**: Focuses on Go-related patterns:
   - Go binaries and test files
   - Vendor directories
   - Temporary files from hot reloading (using Air)
   - Uploaded files (with directory structure preserved using .gitkeep)

Directory structure for uploads has been preserved with .gitkeep files to maintain the structure in Git while ignoring the actual uploaded content.

Special consideration has been given to ignore CSV files, which are used for DSP logs and can be large, while maintaining sample and configuration JSON files needed for the application.

## TypeScript Implementation Notes

TypeScript typing has been improved across the application:

1. **Component Interfaces**: Added proper interfaces for components like DataGrid and MetricComparison
   - DataGrid now has types for columns, data, and sort configuration
   - MetricComparison properly types the metrics data structure

2. **Type Safety**: Added explicit typing for all component props to prevent runtime errors
   - Fixed issues with 'any' implicit types in parameters
   - Added non-null assertions where appropriate

3. **State Management**: Properly typed state hooks with generic types
   - useState<SortConfig> for properly typing the sort configuration
   - Type guards for conditional rendering

This implementation helps catch potential issues at compile time rather than runtime and improves code maintainability and documentation through type definitions.

## Chart Visualization Implementation Notes

The data visualization layer has been enhanced with interactive charts using the Recharts library:

1. **PerformanceChart Component**:
   - Flexible, reusable component supporting multiple chart types (line, area, bar)
   - Type-safe implementation with proper TypeScript interfaces
   - Responsive design that adapts to container size
   - Animated transitions for enhanced user experience
   - Custom tooltips and formatting for better data readability

2. **Integration with Analytics Dashboard**:
   - Bid Performance Metrics chart showing bid prices and win rates
   - Impression Volume chart displaying impressions and clicks over time
   - Charts respond to filter selections (time range, campaign, metrics)

3. **Visual Design Considerations**:
   - Consistent color scheme for related metrics
   - Clear labeling and legends
   - Grid lines for better data readability
   - Animated transitions for a premium feel
   - Shadow and border styling consistent with the overall UI

4. **Future Visualization Enhancements**:
   - Integration with real data from API endpoints
   - Dynamic chart generation based on user-selected metrics
   - Drill-down capabilities for detailed analysis
   - Export functionality for charts and data
   - Additional chart types (scatter, pie, radar) for specialized visualization needs
   - Annotation support for marking important events or thresholds
   - Comparison view for different time periods

The implementation follows the requirements outlined in the RFP, particularly addressing the need for sophisticated data visualization capability with an emphasis on user experience and visual appeal.
