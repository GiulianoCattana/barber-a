#!/bin/bash

echo "🚀 Building frontend..."
cd frontend
npm install
npm run build

echo "✅ Frontend build complete!"
echo "📦 Installing backend dependencies..."
cd ../backend
npm install

echo "🗄️ Initializing database..."
node init-db.js

echo "✅ Backend dependencies installed!"
echo "🎉 Build complete! Ready for deployment."
