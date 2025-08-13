# Firebase Functions

## Environment Variables

This project uses environment variables for configuration. Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

### Required Environment Variables

- `POLYGON_API_KEY`: Your Polygon.io API key for financial data

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run locally with emulator
npm run serve

# Deploy to Firebase
npm run deploy
```

## API Keys Configuration

API keys are now managed through environment variables instead of Firebase documents for better security and easier development workflow.
