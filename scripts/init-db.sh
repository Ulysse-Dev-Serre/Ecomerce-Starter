#!/bin/bash

# PostgreSQL Database Initialization Script for Neon + Prisma
echo "Initializing PostgreSQL environment..."

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push schema to database (creates tables without migration files)
echo "Pushing schema to database..."
npx prisma db push

# Optional: Open Prisma Studio to view your database
echo "Database initialized successfully!"
echo "To view your database, run: npx prisma studio"
