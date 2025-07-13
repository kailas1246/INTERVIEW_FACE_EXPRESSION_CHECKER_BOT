# AI Video Interview Bot - Facial Confidence Analyzer

## Overview

This is a modern web application that analyzes facial confidence and expressions during video interviews using AI-powered face detection. The application provides real-time feedback on confidence levels, eye contact, head posture, and facial expressions through a sleek, high-tech interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with a custom cyber/tech theme featuring dark colors and cyan accents
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible components
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for the server framework
- **Language**: TypeScript throughout the entire stack
- **API Design**: RESTful API structure with `/api` prefix for all endpoints
- **Development**: Hot module replacement and live reloading via Vite integration

### Frontend-Backend Integration
- **Communication**: HTTP-based API calls using fetch with credential support
- **Error Handling**: Centralized error handling with custom error responses
- **Development**: Unified development server that serves both frontend and backend

## Key Components

### Face Detection System
- **AI Library**: face-api.js loaded via CDN for real-time facial analysis
- **Models**: Uses TinyFaceDetector, FaceLandmark68Net, and FaceExpressionNet
- **Analysis Features**:
  - Confidence score calculation based on multiple factors
  - Eye contact detection and scoring
  - Head posture analysis
  - Facial expression recognition with emoji mapping
  - Real-time processing with configurable intervals

### Video Processing
- **Webcam Integration**: Native browser MediaDevices API for camera access
- **Canvas Overlay**: Real-time drawing of detection results on video feed
- **Performance**: Optimized for smooth 30fps analysis without blocking UI

### UI Components
- **VideoFeed**: Camera display with start/stop controls and status indicators
- **ConfidenceScore**: Circular progress indicator showing overall confidence
- **ExpressionAnalysis**: Current expression display with emoji and percentage breakdown
- **RealTimeStats**: Session duration, average scores, and peak performance metrics
- **ScoreChart**: Time-series visualization of confidence and eye contact scores

### Interview Simulation
- **Question Bank**: Predefined set of common interview questions
- **Session Management**: Start/stop analysis with question progression
- **Data Export**: Chart data download functionality for review

## Data Flow

### Initialization Flow
1. Application loads and initializes face-api.js models from CDN
2. User grants camera permissions through browser API
3. Video stream is established and displayed in the interface
4. Face detection models are loaded and validated

### Analysis Flow
1. Video frames are captured at regular intervals (typically 1-2 seconds)
2. Face-api.js processes each frame for:
   - Face detection and landmark identification
   - Expression analysis (happy, sad, angry, neutral, etc.)
   - Eye position and gaze estimation
3. Custom algorithms calculate:
   - Overall confidence score (weighted combination of factors)
   - Eye contact percentage based on gaze direction
   - Head posture score based on face angle and position
4. Results are displayed in real-time through various UI components
5. Historical data is maintained for charting and statistics

### Data Storage
- **Client-side**: All analysis data is stored in browser memory
- **No Persistence**: Currently no backend database integration
- **Export Options**: Users can download chart data as needed

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Query for frontend framework
- **UI Framework**: Radix UI primitives, Lucide React icons, class-variance-authority for component variants
- **Styling**: Tailwind CSS, clsx for conditional classes, tailwind-merge for class optimization
- **Face Detection**: face-api.js via CDN for AI-powered facial analysis
- **Routing**: Wouter for lightweight client-side navigation

### Development Tools
- **Build Tools**: Vite with React plugin for fast development and builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Code Quality**: ESBuild for fast transpilation and bundling
- **Development Server**: Express.js with Vite middleware integration

### Database Preparation
- **ORM**: Drizzle ORM configured for PostgreSQL integration
- **Schema**: Basic user table structure defined in shared schema
- **Migrations**: Drizzle Kit configured for database schema management
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized production bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server code to `dist/index.js`
- **Static Assets**: Frontend assets are served by Express in production

### Environment Configuration
- **Development**: Uses `NODE_ENV=development` with hot reloading and debugging
- **Production**: Uses `NODE_ENV=production` with optimized builds and static serving
- **Database**: Configured via `DATABASE_URL` environment variable for PostgreSQL

### Hosting Requirements
- **Node.js**: Requires Node.js runtime for Express server
- **Database**: PostgreSQL database (currently configured but not actively used)
- **Static Files**: Serves built React application and assets
- **HTTPS**: Recommended for camera access in production browsers

### Development Workflow
- **Local Development**: Single command (`npm run dev`) starts both frontend and backend
- **Database Operations**: `npm run db:push` applies schema changes
- **Type Checking**: `npm run check` validates TypeScript across the entire codebase
- **Production Build**: `npm run build` creates optimized production bundle

The application is designed as a complete, self-contained interview analysis tool that can be easily deployed to any Node.js hosting platform while maintaining high performance and user experience standards.