# ⚡ Quick Start - 3 Minutos

## 🎯 Objetivo

Desplegar el servidor de firmas HMAC-SHA256 en Coolify para usarlo desde n8n.

---

## 📋 Requisitos

- [ ] Cuenta en GitHub
- [ ] Acceso a Coolify
- [ ] n8n instalado

---

## 🚀 Deployment (5 pasos)

### 1️⃣ Crear Repositorio GitHub (1 min)

```bash
# Ir a: https://github.com/new
# Nombre: binance-signature-server
# Visibilidad: Private
# Click: Create repository
```

### 2️⃣ Push del Código (1 min)

```bash
cd server_sign

# Configurar remote
git remote add origin https://github.com/TU_USUARIO/binance-signature-server.git

# Push
git push -u origin main
```

### 3️⃣ Deploy en Coolify (2 min)

1. Login en Coolify
2. **New Resource** → **Public Repository**
3. Configurar:
   ```
   Repository: https://github.com/TU_USUARIO/binance-signature-server
   Branch: main
   Build Pack: Dockerfile
   Port: 3333
   Health Check: /health
   ```
4. Click **"Deploy"**
5. Esperar ~30-60 segundos

### 4️⃣ Verificar (30 seg)

```bash
# Reemplaza con tu URL de Coolify
curl https://your-app.coolify.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "service": "binance-signature-server",
  "version": "1.0.0",
  ...
}
```

### 5️⃣ Configurar n8n (30 seg)

**En el nodo "Prepare Balance Request":**

```javascript
const config = $input.first().json;
const credentials = $input.last().json;

const API_KEY = config.USE_TESTNET ? credentials.TESTNET_API_KEY : credentials.PRODUCTION_API_KEY;
const SECRET_KEY = config.USE_TESTNET ? credentials.TESTNET_SECRET_KEY : credentials.PRODUCTION_SECRET_KEY;

const timestamp = Date.now();
const queryString = `timestamp=${timestamp}&recvWindow=5000`;

// 👇 TU URL DE COOLIFY AQUÍ
const signatureUrl = `https://your-app.coolify.com/sign?secret=${encodeURIComponent(SECRET_KEY)}&message=${encodeURIComponent(queryString)}`;

return [{
  json: {
    signatureUrl: signatureUrl,
    queryString: queryString,
    apiKey: API_KEY,
    config: config,
    credentials: credentials
  }
}];
```

**Añadir nodo HTTP Request después:**

- **Method:** GET
- **URL:** `={{ $json.signatureUrl }}`

**Añadir nodo Code después:**

```javascript
const requestData = $input.first().json;
const signatureResponse = $json;

const signature = signatureResponse.signature;
const config = requestData.config;
const queryString = requestData.queryString;

const url = `${config.BASE_URL}/api/v3/account?${queryString}&signature=${signature}`;

return [{
  json: {
    url: url,
    apiKey: requestData.apiKey,
    config: config,
    credentials: requestData.credentials
  }
}];
```

**Conectar al nodo "Get Binance Balance"**

---

## ✅ Listo!

Ya puedes ejecutar tu workflow en n8n y debería funcionar con Binance Testnet.

---

## 🧪 Test Local (Opcional)

Si quieres probar localmente primero:

```bash
cd server_sign

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

En otra terminal:

```bash
# Test
./test.sh
```

Deberías ver:
```
✅ All tests passed!
```

---

## 🆘 Problemas?

### Error -1022 "Signature not valid"

**Causa:** URL del servidor incorrecta

**Solución:**
```bash
# Verificar que la URL funciona
curl https://your-app.coolify.com/health

# Si no funciona, revisa:
# 1. Deployment en Coolify exitoso?
# 2. Puerto 3333 expuesto?
# 3. Health check pasando?
```

### Error "Cannot connect to signature server"

**Causa:** Red privada de Coolify

**Solución:**
```
En Coolify → Settings → Network
Cambiar a: Public Access
```

### Error "Module not found"

**Causa:** Node.js version

**Solución:**
```dockerfile
# Verificar en Dockerfile que sea Node 20+
FROM node:20-alpine
```

---

## 📚 Más Información

- **README.md** - Documentación completa
- **DEPLOYMENT.md** - Guía detallada de deployment
- **test.sh** - Script de testing

---

## 🎉 Success!

Si llegaste aquí y todo funciona:

✅ Servidor desplegado en Coolify
✅ n8n configurado
✅ Firmas HMAC-SHA256 funcionando
✅ Binance API autenticando correctamente

**Próximo paso:** Probar el workflow completo en Binance Testnet!
