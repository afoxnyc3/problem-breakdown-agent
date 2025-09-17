/**
 * Simple development server for testing the API locally
 */

import { createServer } from 'http';
import handler from './index.js';

const PORT = 3000;

const server = createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Collect request body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const mockReq = {
        method: req.method,
        body: body ? JSON.parse(body) : {}
      };

      const mockRes = {
        statusCode: 200,
        headers: {},
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          res.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data, null, 2));
        }
      };

      await handler(mockReq as any, mockRes as any);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }, null, 2));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}/api/analyze`);
  console.log('\nTest with:');
  console.log(`curl -X POST http://localhost:${PORT}/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"problem": "Your problem here"}'`);
});