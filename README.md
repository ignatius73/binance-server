# 🔐 Binance Signature Server

Microservicio HTTP que genera firmas HMAC-SHA256 para autenticación con la API de Binance.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Descripción

Este servidor proporciona un endpoint HTTP simple para generar firmas HMAC-SHA256, necesarias para autenticar peticiones a la API de Binance. Utiliza el módulo `crypto` nativo de Node.js para garantizar firmas 100% correctas y compatibles.

### ¿Por qué?

Las implementaciones de HMAC-SHA256 en JavaScript puro (sin módulos nativos) pueden tener bugs sutiles que generan firmas inválidas. Este servidor resuelve ese problema usando Node.js crypto nativo.

## ✨ Características

- ✅ **Confiable** - Usa Node.js crypto nativo
- ✅ **Rápido** - Respuesta instantánea
- ✅ **Ligero** - ~10MB de imagen Docker
- ✅ **Seguro** - Ejecuta como usuario no-root
- ✅ **CORS** - Habilitado para todos los orígenes
- ✅ **Health Check** - Endpoint `/health` incluido
- ✅ **Metrics** - Contador de requests
- ✅ **Docker Ready** - Dockerfile optimizado multi-stage

## 🚀 Quick Start

### Local (Node.js)

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:3333`

### Docker

```bash
# Build
docker build -t binance-signature-server .

# Run
docker run -p 3333:3333 binance-signature-server
```

### Docker Compose

```bash
docker-compose up -d
```

## 📡 API Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "binance-signature-server",
  "version": "1.0.0",
  "uptime": "3600s",
  "requests": 1523,
  "timestamp": "2026-01-12T10:30:00.000Z"
}
```

### GET /sign

Genera una firma HMAC-SHA256.

**Parameters:**
- `secret` (string, required) - Secret key para HMAC
- `message` (string, required) - Mensaje a firmar

**Example:**
```bash
curl "http://localhost:3333/sign?secret=my_secret_key&message=timestamp=1768249627542&recvWindow=5000"
```

**Response:**
```json
{
  "signature": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "message": "timestamp=1768249627542&recvWindow=5000",
  "timestamp": "2026-01-12T10:30:00.000Z"
}
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3333` | Puerto del servidor |
| `HOST` | `0.0.0.0` | Host del servidor |
| `NODE_ENV` | - | Entorno (production/development) |

### Ejemplo

```bash
PORT=8080 HOST=127.0.0.1 npm start
```

## 🐳 Docker

### Build Optimizado

El Dockerfile usa multi-stage build para minimizar el tamaño final:

```dockerfile
# Build stage - instala dependencias
FROM node:20-alpine AS builder
...

# Production stage - solo archivos necesarios
FROM node:20-alpine
...
```

**Resultado:** Imagen final de ~80MB (vs ~1GB sin optimizar)

### Security Features

- ✅ Ejecuta como usuario no-root (`nodejs:nodejs`)
- ✅ Image Alpine (minimal attack surface)
- ✅ Health checks integrados
- ✅ Graceful shutdown
- ✅ Error handling completo

### Docker Compose

El archivo `docker-compose.yml` incluye:
- Health checks
- Restart policies
- Log rotation
- Network isolation

## ☁️ Deployment en Coolify

### Paso 1: Push al Repositorio

```bash
cd server_sign
git init
git add .
git commit -m "Initial commit: Binance Signature Server"
git remote add origin https://github.com/TU_USUARIO/binance-signature-server.git
git push -u origin main
```

### Paso 2: Configurar en Coolify

1. **Crear nuevo recurso** → "Docker Compose"
2. **Repository URL:** `https://github.com/TU_USUARIO/binance-signature-server.git`
3. **Branch:** `main`
4. **Build Command:** `docker build -t binance-signature-server .`
5. **Port Mapping:** `3333:3333`

### Paso 3: Variables de Entorno (Opcional)

```
PORT=3333
HOST=0.0.0.0
NODE_ENV=production
```

### Paso 4: Deploy

Click en **"Deploy"** y espera ~30 segundos.

### Paso 5: Verificar

```bash
curl https://your-coolify-url.com/health
```

## 📊 Monitoreo

### Logs

```bash
# Docker
docker logs binance-signature-server -f

# Docker Compose
docker-compose logs -f signature-server
```

### Métricas

El endpoint `/health` incluye:
- Uptime del servidor
- Total de requests servidos
- Timestamp actual

## 🔐 Seguridad

### Consideraciones

⚠️ **IMPORTANTE:** Este servidor acepta secret keys como parámetros de URL.

**Recomendaciones:**
- ✅ Usar HTTPS en producción
- ✅ Restringir acceso por firewall/VPC
- ✅ No exponer públicamente
- ✅ Usar solo en redes privadas/seguras

### Uso Recomendado

```
[n8n Workflow] → [VPC privada] → [Signature Server] → [Binance API]
```

## 🧪 Testing

### Test Manual

```bash
# Test health endpoint
curl http://localhost:3333/health

# Test signature generation
curl "http://localhost:3333/sign?secret=test_secret&message=hello_world"
```

### Test con Binance

```javascript
// En tu workflow n8n
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}&recvWindow=5000`;
const signUrl = `http://signature-server:3333/sign?secret=${SECRET_KEY}&message=${queryString}`;

// Llama al servidor
const response = await $http.get(signUrl);
const signature = response.signature;

// Usa la firma en Binance API
const binanceUrl = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;
```

## 📝 Changelog

### v1.0.0 (2026-01-12)

- ✅ Initial release
- ✅ HMAC-SHA256 signature generation
- ✅ Health check endpoint
- ✅ Docker support
- ✅ Coolify ready
- ✅ Production hardening

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE)

## 👤 Autor

**Gabriel Garcia**

## 🙏 Agradecimientos

- Node.js crypto module
- Docker Alpine images
- Coolify platform

---

**⚡ Binance Signature Server v1.0.0**
🔐 Secure HMAC-SHA256 signatures for Binance API
