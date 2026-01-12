import http from 'http';
import crypto from 'crypto';
import url from 'url';

const PORT = process.env.PORT || 3333;
const HOST = process.env.HOST || '0.0.0.0';

// Request counter for metrics
let requestCount = 0;
const startTime = Date.now();

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(secret, message) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Main HTTP server
 */
const server = http.createServer((req, res) => {
  requestCount++;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Health check endpoint
  if (pathname === '/health' || pathname === '/') {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      service: 'binance-signature-server',
      version: '1.0.0',
      uptime: `${uptime}s`,
      requests: requestCount,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Signature endpoint
  if (pathname === '/sign') {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const { secret, message } = parsedUrl.query;

    // Validate parameters
    if (!secret || !message) {
      res.writeHead(400);
      res.end(JSON.stringify({
        error: 'Missing required parameters',
        required: ['secret', 'message']
      }));
      return;
    }

    try {
      const signature = generateSignature(secret, message);

      res.writeHead(200);
      res.end(JSON.stringify({
        signature,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        timestamp: new Date().toISOString()
      }));

      console.log(`✅ [${new Date().toISOString()}] Signed: ${message.substring(0, 30)}... → ${signature.substring(0, 16)}...`);
    } catch (error) {
      console.error(`❌ Error generating signature:`, error);
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Failed to generate signature',
        details: error.message
      }));
    }
    return;
  }

  // 404 for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Endpoint not found',
    available: ['/health', '/sign']
  }));
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Binance Signature Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 URL:        http://${HOST}:${PORT}`);
  console.log(`💚 Health:     http://${HOST}:${PORT}/health`);
  console.log(`🔐 Endpoint:   http://${HOST}:${PORT}/sign?secret=KEY&message=DATA`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server ready on ${HOST}:${PORT}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('');
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed');
    console.log(`📊 Total requests served: ${requestCount}`);
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
