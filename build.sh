#!/bin/bash
set -e  # Exit on error

echo "🧹 Cleaning old builds..."
rm -rf frontend/dist frontend/.angular

echo "🚀 Building frontend..."
cd frontend
npm ci --legacy-peer-deps
npm run build

echo "✅ Verificando build del frontend..."
if [ ! -f "dist/frontend/browser/index.html" ]; then
  echo "❌ ERROR: Frontend build failed - index.html not found"
  exit 1
fi
echo "✅ Frontend build OK - Files found:"
ls -lh dist/frontend/browser/ | head -10

echo "📦 Installing backend dependencies..."
cd ../backend
npm ci --legacy-peer-deps

echo "🗄️ Initializing database..."
if [ -n "$DATABASE_URL" ]; then
  node init-db.js || echo "⚠️  Warning: Database initialization failed (will retry on start)"
else
  echo "⚠️  DATABASE_URL not set, skipping database initialization"
fi

echo "✅ Backend dependencies installed!"
echo "🎉 Build complete! Ready for deployment."
