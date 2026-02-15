# Vercel Production Deployment Checklist

## 🎯 What Was Fixed

### 1. **database.config.js** ✅
- ✅ SSL configuration already correct for Supabase
- ✅ Connection pooling optimized for serverless
- ✅ Environment-aware dotenv loading
- ✅ Enhanced comments for clarity

### 2. **database.ts** ✅
- ✅ **CRITICAL FIX**: Removed `throw` in production to prevent serverless crashes
- ✅ Graceful error handling that allows CORS middleware to run
- ✅ Better logging for debugging connection issues
- ✅ Environment-specific Sequelize configuration
- ✅ Database sync disabled in production

### 3. **server.ts** ✅
- ✅ **CRITICAL FIX**: CORS moved to absolute first position
- ✅ **CRITICAL FIX**: Environment loading before ALL imports
- ✅ **CRITICAL FIX**: Models imported AFTER environment setup
- ✅ **CRITICAL FIX**: No `app.listen()` in production mode
- ✅ Frontend URL hardcoded in CORS allowed origins
- ✅ Enhanced health check endpoint with environment info
- ✅ Proper serverless export pattern

---

## 🔧 Vercel Environment Variables to Set

Go to your Vercel project settings → Environment Variables and ensure these are set:

### Required Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
CORS_ORIGIN=https://content-management-system-udo3.vercel.app
JWT_SECRET=your-secure-jwt-secret
```

### Optional Variables:
```bash
PORT=5000  # Not needed for Vercel, but good for local testing
```

---

## 🚀 Deployment Steps

### 1. Commit and Push Changes
```bash
cd /home/maazahmad/Desktop/Morphelabs/CMS
git add backend/src/config/database.config.js
git add backend/src/config/database.ts
git add backend/src/server.ts
git commit -m "fix: Production-ready Vercel deployment with CORS and SSL fixes"
git push origin main
```

### 2. Verify Vercel Auto-Deploy
- Vercel should automatically detect the push and start deploying
- Monitor the deployment at: https://vercel.com/dashboard

### 3. Test the Deployment

#### Test 1: Root Endpoint (Should return 200, not 500)
```bash
curl https://content-management-system-kappa-six.vercel.app/
```

**Expected Response:**
```json
{
  "success": true,
  "status": "Online",
  "message": "Morphe Labs CMS API",
  "environment": "production",
  "timestamp": "2026-02-15T12:30:25.000Z"
}
```

#### Test 2: CORS Headers (Should include Access-Control-Allow-Origin)
```bash
curl -I -X OPTIONS https://content-management-system-kappa-six.vercel.app/api/v1/auth/login \
  -H "Origin: https://content-management-system-udo3.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

**Expected Headers:**
```
Access-Control-Allow-Origin: https://content-management-system-udo3.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
```

#### Test 3: API Endpoint (Should work from frontend)
Open your frontend at `https://content-management-system-udo3.vercel.app` and try logging in or making any API call.

---

## 🔍 Debugging Production Issues

### Check Vercel Logs
1. Go to https://vercel.com/dashboard
2. Click on your backend deployment
3. Go to "Functions" tab
4. Click on any function to see real-time logs

### Common Issues and Solutions

#### Issue: Still getting 500 errors
**Check:**
- ✅ DATABASE_URL is set in Vercel environment variables
- ✅ Using Transaction Pooler URL (port 6543, not 5432)
- ✅ SSL mode is in the connection string: `?sslmode=require`

**Fix:**
```bash
# Correct format:
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

#### Issue: CORS errors persist
**Check:**
- ✅ CORS_ORIGIN matches your frontend URL exactly
- ✅ No trailing slashes in CORS_ORIGIN
- ✅ Frontend is making requests to the correct backend URL

**Fix:**
```bash
# Set in Vercel:
CORS_ORIGIN=https://content-management-system-udo3.vercel.app
```

#### Issue: Database connection timeout
**Check:**
- ✅ Using Transaction Pooler (port 6543), not Direct Connection (port 5432)
- ✅ Supabase project is not paused
- ✅ SSL is enabled in connection string

**Fix:**
```bash
# Use Transaction Pooler URL:
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

---

## 📊 What Changed and Why

### Before (Broken):
1. ❌ Server crashed on startup → No CORS headers sent → Browser blocked request
2. ❌ `.env.development` loaded in production → File not found → Crash
3. ❌ `throw` on missing DATABASE_URL → Serverless function died immediately
4. ❌ CORS middleware not first → Preflight OPTIONS requests failed

### After (Fixed):
1. ✅ Server starts successfully → CORS headers sent → Browser allows request
2. ✅ `.env.development` only loaded locally → No file errors in production
3. ✅ Graceful error logging → Server continues, can send error responses
4. ✅ CORS absolutely first → All requests handled correctly

---

## 🎉 Success Criteria

Your deployment is successful when:

- [ ] Root endpoint returns 200 OK with JSON response
- [ ] CORS headers present in all responses
- [ ] Frontend can make API calls without CORS errors
- [ ] Database connection established (check Vercel logs)
- [ ] No 500 errors on any endpoint
- [ ] Health check shows `"environment": "production"`

---

## 🆘 Still Having Issues?

If you're still experiencing problems after following this checklist:

1. **Check Vercel Function Logs** for specific error messages
2. **Verify Environment Variables** are set correctly (no typos)
3. **Test Database Connection** using Supabase's SQL Editor
4. **Check Supabase Status** at https://status.supabase.com/

### Get Help:
- Share the Vercel function logs
- Share the exact error message from browser console
- Verify DATABASE_URL format matches the Transaction Pooler URL

---

## 📝 Notes

- **Local Development**: Still uses `.env.development` file
- **Production**: Uses Vercel environment variables (no .env file)
- **Database Sync**: Disabled in production (use migrations instead)
- **Logging**: Reduced in production for cleaner Vercel logs
- **SSL**: Required for Supabase external connections
- **Port**: 6543 for Transaction Pooler (IPv4 compatible)
