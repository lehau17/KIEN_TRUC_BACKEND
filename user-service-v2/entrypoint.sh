#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."

until npx prisma db push; do
  echo "Database is not ready, retrying in 3 seconds..."
  sleep 5
done

echo "Database is ready! Running Prisma generate..."
npx prisma generate

exec "$@"
