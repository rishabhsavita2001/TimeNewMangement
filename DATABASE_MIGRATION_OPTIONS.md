# Database Migration Options for Vercel Deployment

## Current Issue
- Database server (217.20.195.77:5432) is not externally accessible
- Only accessible through SSH tunnel
- Vercel serverless cannot create SSH tunnels

## Solution Options:

### Option 1: Neon Database (Recommended) 🌟
- Free tier available
- Vercel-compatible PostgreSQL
- Built for serverless
- Auto-scaling and connection pooling
- Setup: https://neon.tech/

### Option 2: Supabase Database 
- Free tier: 500MB storage, 2 database
- PostgreSQL compatible
- Built-in connection pooling
- Setup: https://supabase.com/

### Option 3: PlanetScale
- MySQL-based (need to modify queries)
- Excellent Vercel integration
- Free tier available
- Setup: https://planetscale.com/

### Option 4: Railway Database
- PostgreSQL support
- Easy Vercel integration
- Free tier with limitations
- Setup: https://railway.app/

### Option 5: Configure Current Server (Complex)
- Open firewall on cloud provider
- Configure PostgreSQL for external access
- Security risks involved

## Current Database Export
We need to export current database and import to new service.

Run this to export current data:
```bash
# Through SSH tunnel
ssh -L 5433:localhost:5432 sdadmin@217.20.195.77 -p 3022 -i "C:\Users\bhoomi\.ssh\id_ed25519" -N &
pg_dump -h localhost -p 5433 -U sdadmin -d timemanagement > database_backup.sql
```

## Recommendation
Use **Neon** for best Vercel compatibility and easy migration.