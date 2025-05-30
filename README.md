# TaskVision Frontend

This is the frontend application for TaskVision, built with React and TypeScript.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment files:
   - `.env.dev` for development
   - `.env.prod` for production

3. Start development server:
   ```bash
   npm run start:dev
   ```

## Deployment

The application is automatically deployed to production when changes are pushed to the `main` branch. The deployment process:

1. Builds the application using production environment variables
2. Updates DNS records using Terraform
3. Uploads the build to S3
4. Invalidates the CloudFront cache

## Infrastructure

The infrastructure is managed using Terraform and includes:
- ACM certificate for the domain
- Route53 DNS records
- S3 bucket for static hosting
- CloudFront distribution for content delivery

## Environment Variables

Required environment variables:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_AUTH0_DOMAIN`: Auth0 domain
- `REACT_APP_AUTH0_CLIENT_ID`: Auth0 client ID
- `REACT_APP_AUTH0_AUDIENCE`: Auth0 audience
- `REACT_APP_AUTH0_CALLBACK_URL`: Auth0 callback URL
- `REACT_APP_CDN`: CDN URL
- `REACT_APP_API_SERVER_URL`: Backend API URL

