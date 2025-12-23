# 🔧 Bearer Token को Swagger UI में कैसे Use करें

## 📋 Step-by-Step Instructions:

### Step 1: Swagger UI खोलें
🔗 **URL**: https://api-layer.vercel.app/api-docs

### Step 2: Test Token Generate करें
1. Swagger UI में `/api/get-token` endpoint को expand करें
2. "Try it out" पर click करें
3. "Execute" पर click करें  
4. Response में आपको एक test token मिलेगा जैसे:
   ```json
   {
     "success": true,
     "token": "test-bearer-token-1734346123456",
     "instructions": "Copy this token and use it in Swagger UI..."
   }
   ```

### Step 3: Authorization Setup करें
1. **Swagger UI के top right में "Authorize" button पर click करें** 🔐
2. **bearerAuth section में:**
   - **Value field में token paste करें** (बिना "Bearer" word के)
   - Example: `test-bearer-token-1734346123456`
3. **"Authorize" button पर click करें**
4. **"Close" पर click करें**

### Step 4: APIs Test करें
अब सभी APIs में आपको 🔒 lock symbol दिखेगा जिसका मतलब है authorization set है:

1. **कोई भी API endpoint select करें** (जैसे `/api/profile`)
2. **"Try it out" पर click करें**
3. **"Execute" पर click करें**
4. **Status 200 और proper response मिलेगा**

## ✅ Working APIs List:
- ✅ `/api/health` - Health check (no auth needed)
- ✅ `/api/get-token` - Get test token (no auth needed) 
- ✅ `/api/test` - Test API with auth
- ✅ `/api/profile` - User profile
- ✅ `/api/dashboard` - Dashboard data  
- ✅ `/api/time-entries` - Time entries
- ✅ `/api/leave-requests` - Leave requests
- ✅ `/api/projects` - Projects list

## 🔍 Troubleshooting:
1. **अगर token expire हो जाए**: नया token generate करें `/api/get-token` से
2. **अगर APIs 401 error दें**: Authorize button से token re-enter करें
3. **Console errors**: Browser F12 → Console tab check करें

## 💡 Important Notes:
- **Test Environment**: यह demo environment है, कोई भी token work करेगा
- **Production Bypass**: Authentication bypass mode active है testing के लिए
- **Persistent Auth**: Token browser में save रहेगा session के दौरान

---
**🎯 अब Swagger UI में सभी APIs properly work करनी चाहिए!**