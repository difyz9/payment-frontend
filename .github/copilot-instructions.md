# Copilot Instructions for Payment Service Web UI

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js TypeScript frontend application for managing payment service API applications. The application provides a web interface to create, manage, and monitor payment applications that use appId/appSecret authentication.

## Key Features
- API Application Management (CRUD operations for appId/appSecret)
- Payment Order Monitoring
- Authentication and API key management
- Dashboard with statistics and analytics
- Responsive design with Tailwind CSS

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- React Hook Form for form handling
- Axios for API calls
- shadcn/ui for UI components

## API Integration
The frontend communicates with a Go-based payment service backend that requires:
- API authentication using appId/appSecret with HMAC-SHA256 signatures
- Support for Alipay and WeChat payment methods
- Order creation, querying, and management

## Coding Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling and loading states
- Use server-side rendering where appropriate
- Follow React best practices and hooks patterns
- Implement proper form validation
- Use environment variables for API endpoints

## Backend API Endpoints
- Base URL: configurable via environment variables
- Authentication: HMAC-SHA256 signature with appId/appSecret
- Key endpoints: /api/v1/apps, /api/v1/pay, /api/v1/orders, /api/v1/query

## Security Considerations
- Never expose appSecret in client-side code
- Use secure HTTP headers for API communication
- Implement proper input validation
- Handle authentication errors gracefully
