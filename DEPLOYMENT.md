# 🚀 Deployment Guide

## Quick Deploy en Coolify

### Opción 1: Desde GitHub (Recomendado)

#### Paso 1: Crear Repositorio en GitHub

```bash
# Crea un nuevo repositorio en GitHub
# https://github.com/new

# Nombre sugerido: binance-signature-server
# Visibilidad: Private (recomendado)
```

#### Paso 2: Push al Repositorio

```bash
cd server_sign

# Añadir remote
git remote add origin https://github.com/TU_USUARIO/binance-signature-server.git

# Push
git branch -M main
git push -u origin main
```

#### Paso 3: Configurar en Coolify

1. **Login en Coolify:** https://tu-coolify.com
2. **New Resource** → **Public Repository**
3. **Repository URL:** `https://github.com/TU_USUARIO/binance-signature-server`
4. **Branch:** `main`
5. **Build Pack:** `Dockerfile`
6. **Port:** `3333`
7. **Health Check Path:** `/health`

#### Paso 4: Environment Variables (Opcional)

```
PORT=3333
HOST=0.0.0.0
NODE_ENV=production
```

#### Paso 5: Deploy

Click **"Deploy"** y espera ~30-60 segundos.

---

### Opción 2: Docker Manual

#### Build Local

```bash
cd server_sign

# Build imagen
docker build -t binance-signature-server:latest .

# Tag para registry
docker tag binance-signature-server:latest registry.tu-coolify.com/binance-signature-server:latest

# Push
docker push registry.tu-coolify.com/binance-signature-server:latest
```

#### Deploy en Coolify

1. **New Resource** → **Docker Image**
2. **Image:** `registry.tu-coolify.com/binance-signature-server:latest`
3. **Port:** `3333`
4. **Health Check:** `/health`

---

### Opción 3: Docker Compose

#### Upload docker-compose.yml

```bash
# Copia el archivo a tu servidor
scp docker-compose.yml user@server:/path/to/deploy/

# SSH al servidor
ssh user@server

# Deploy
cd /path/to/deploy
docker-compose up -d
```

---

## Verificación Post-Deploy

### 1. Health Check

```bash
curl https://your-app.coolify.com/health
```

Esperado:
```json
{
  "status": "ok",
  "service": "binance-signature-server",
  "version": "1.0.0",
  "uptime": "60s",
  "requests": 1,
  "timestamp": "2026-01-12T10:30:00.000Z"
}
```

### 2. Test Signature

```bash
curl "https://your-app.coolify.com/sign?secret=test&message=hello"
```

Esperado:
```json
{
  "signature": "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b",
  "message": "hello",
  "timestamp": "2026-01-12T10:30:00.000Z"
}
```

### 3. Test desde n8n

```javascript
// En tu workflow n8n
const signUrl = `https://your-app.coolify.com/sign?secret=${SECRET_KEY}&message=${queryString}`;
const response = await $http.get(signUrl);
console.log('Signature:', response.signature);
```

---

## Troubleshooting

### Error: Container no inicia

**Solución:**
```bash
# Ver logs
docker logs binance-signature-server

# Verificar health check
docker inspect binance-signature-server | grep -A 10 Health
```

### Error: Health check falla

**Posibles causas:**
1. Puerto incorrecto (debe ser 3333)
2. Servidor no responde en `/health`
3. Firewall bloqueando

**Solución:**
```bash
# Test local
docker run -p 3333:3333 binance-signature-server
curl http://localhost:3333/health
```

### Error: Signature inválida

**Verificar:**
1. Secret key correcta
2. Message string sin encoding incorrecto
3. URL encoding de parámetros

**Test:**
```bash
# Comparar con Node.js crypto
node -e "console.log(require('crypto').createHmac('sha256', 'test').update('hello').digest('hex'))"
```

---

## Monitoreo

### Logs en Coolify

1. Dashboard → Tu App → **Logs**
2. Real-time logs
3. Filtrar por error/warning

### Metrics

El endpoint `/health` incluye:
- `uptime` - Tiempo activo del servidor
- `requests` - Total de requests procesados
- `timestamp` - Timestamp actual

### Alertas

Configurar en Coolify:
1. **Settings** → **Notifications**
2. **Health Check Failed** → Telegram/Email
3. **Container Restart** → Telegram/Email

---

## Scaling

### Horizontal Scaling

Coolify soporta múltiples réplicas:

1. **Settings** → **Scale**
2. **Replicas:** 2-5
3. **Load Balancer:** Automático

### Vertical Scaling

Ajustar recursos:

```yaml
# .coolify.yml
resources:
  limits:
    memory: 512Mi  # Aumentar de 256Mi
    cpu: 1.0       # Aumentar de 0.5
```

---

## Seguridad

### HTTPS

Coolify configura HTTPS automáticamente con Let's Encrypt.

### Private Network

Recomendado: Desplegar en red privada de Coolify

1. **Settings** → **Network**
2. **Visibility:** Internal Only
3. **Access:** Solo desde n8n workflow

### Firewall

```bash
# Solo permitir tráfico interno
iptables -A INPUT -p tcp --dport 3333 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 3333 -j DROP
```

---

## Backup & Recovery

### Backup del Código

```bash
# GitHub ya sirve como backup
git push origin main
```

### Recovery

```bash
# Re-deploy en Coolify
# 1. Dashboard → Tu App
# 2. Click "Redeploy"
# 3. Espera 30-60 segundos
```

### Rollback

```bash
# Coolify guarda deployments anteriores
# 1. Dashboard → Tu App → Deployments
# 2. Selecciona versión anterior
# 3. Click "Rollback"
```

---

## CI/CD (Opcional)

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Coolify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Coolify
        run: |
          curl -X POST https://your-coolify.com/api/deploy \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            -d '{"service": "binance-signature-server"}'
```

---

## Checklist Pre-Deploy

- [ ] Código testeado localmente
- [ ] Docker build exitoso
- [ ] Tests pasando (`./test.sh`)
- [ ] Variables de entorno configuradas
- [ ] Health check funcionando
- [ ] Repositorio Git actualizado
- [ ] README.md completo
- [ ] Secrets no expuestos en código

---

## Checklist Post-Deploy

- [ ] Health check OK
- [ ] Test de firma exitoso
- [ ] Logs sin errores
- [ ] Integración con n8n funciona
- [ ] Monitoring configurado
- [ ] Alerts configurados
- [ ] Backup verificado
- [ ] Documentación actualizada

---

## Soporte

### Logs

```bash
# Coolify UI
Dashboard → App → Logs

# CLI
coolify logs binance-signature-server -f
```

### Debug

```bash
# Conectar al container
docker exec -it binance-signature-server sh

# Ver procesos
ps aux

# Test interno
wget -O- http://localhost:3333/health
```

---

**✅ Ready to Deploy!**

Para deployment inmediato, sigue **Opción 1: Desde GitHub**.
