import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// VMC State
let vendingState = {
  status: 'idle', // 'idle' or 'vending'
  currentItems: [],
  startTime: null,
  timeout: null
};

// Broadcast to all connected WebSocket clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  // Send current status to new client
  ws.send(JSON.stringify({
    type: 'status',
    status: vendingState.status,
    items: vendingState.currentItems
  }));

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// WebSocket endpoint for vending events

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  // Send current status on connect
  ws.send(JSON.stringify({
    type: 'status',
    status: vendingState.status,
    items: vendingState.currentItems
  }));

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON'
      }));
      return;
    }

    // Handle vend command
    if (data.type === 'vend') {
      const { items } = data;

      // Validate input
      if (!Array.isArray(items) || items.length === 0) {
        ws.send(JSON.stringify({
          type: 'vend-response',
          success: false,
          message: 'Invalid items array. Expected non-empty array of item numbers.'
        }));
        return;
      }

      // Check if already vending
      if (vendingState.status === 'vending') {
        ws.send(JSON.stringify({
          type: 'vend-response',
          success: false,
          message: 'Vending machine is currently busy',
          currentItems: vendingState.currentItems
        }));
        return;
      }

      // Update state to vending
      vendingState.status = 'vending';
      vendingState.currentItems = items;
      vendingState.startTime = Date.now();

      // Broadcast status change to all clients
      broadcast({
        type: 'status',
        status: 'vending',
        items: items,
        message: 'Vending started'
      });

      // Respond to this client that vending has started
      ws.send(JSON.stringify({
        type: 'vend-response',
        success: true,
        message: 'Vending started',
        items: items,
        estimatedTime: 5000 // 5 seconds
      }));

      // Simulate vending process (5 seconds delay)
      const vendingDelay = 5000;

      vendingState.timeout = setTimeout(() => {
        // Complete vending
        vendingState.status = 'idle';
        const vendedItems = [...vendingState.currentItems];
        vendingState.currentItems = [];
        vendingState.startTime = null;
        vendingState.timeout = null;

        // Broadcast completion to all clients
        broadcast({
          type: 'vend-complete',
          status: 'idle',
          message: 'Vending completed successfully',
          vendedItems: vendedItems,
          timestamp: new Date().toISOString()
        });

        console.log(`Vending completed for items: ${vendedItems.join(', ')}`);
      }, vendingDelay);
    }

    // Handle status request
    else if (data.type === 'status') {
      let response = {
        type: 'status',
        status: vendingState.status,
        timestamp: new Date().toISOString()
      };

      if (vendingState.status === 'vending') {
        const elapsed = Date.now() - vendingState.startTime;
        response = {
          ...response,
          items: vendingState.currentItems,
          elapsedTime: elapsed,
          message: 'Vending in progress'
        };
      } else {
        response.message = 'Machine is idle';
      }
      ws.send(JSON.stringify(response));
    }

    // Health check (optional)
    else if (data.type === 'health') {
      ws.send(JSON.stringify({
        type: 'health',
        status: 'healthy',
        service: 'VMC Mock Server',
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🤖 VMC Mock Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`\nEndpoints:`);
  console.log(`  POST http://localhost:${PORT}/vend`);
  console.log(`  GET  http://localhost:${PORT}/status`);
  console.log(`  WS   ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down VMC Mock Server...');
  if (vendingState.timeout) {
    clearTimeout(vendingState.timeout);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
