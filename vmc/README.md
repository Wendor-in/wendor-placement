# VMC Mock Server

Mock Vending Machine Controller with WebSocket support for real-time status updates and vending operations.

## Features

- ✅ WebSocket-based API for all operations
- ✅ Real-time status updates via WebSocket
- ✅ Simulated vending delays (5 seconds)
- ✅ Status tracking (idle/vending)
- ✅ ES6 modules support
- ✅ Graceful shutdown handling

## Installation

```bash
npm install
```

## Running the Server

```bash
# Standard mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

The server will start on port **3002** by default.

## WebSocket Connection

Connect to `ws://localhost:3002` to interact with the VMC server. Upon connection, you'll immediately receive the current status.

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3002');
```

## WebSocket Message Types

### Client → Server Messages

#### 1. **Vend Request**
Trigger a vending operation for specified items.

**Message:**
```json
{
  "type": "vend",
  "items": [101, 202, 105]
}
```

**Response (Success):**
```json
{
  "type": "vend-response",
  "success": true,
  "message": "Vending started",
  "items": [101, 202, 105],
  "estimatedTime": 5000
}
```

**Response (Error - Already Vending):**
```json
{
  "type": "vend-response",
  "success": false,
  "message": "Vending machine is currently busy",
  "currentItems": [101, 202, 105]
}
```

**Response (Error - Invalid Input):**
```json
{
  "type": "vend-response",
  "success": false,
  "message": "Invalid items array. Expected non-empty array of item numbers."
}
```

#### 2. **Status Request**
Request the current vending machine status.

**Message:**
```json
{
  "type": "status"
}
```

**Response (Idle):**
```json
{
  "type": "status",
  "status": "idle",
  "message": "Machine is idle",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

**Response (Vending):**
```json
{
  "type": "status",
  "status": "vending",
  "items": [101, 202, 105],
  "elapsedTime": 2340,
  "message": "Vending in progress",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

#### 3. **Health Check**
Check server health status.

**Message:**
```json
{
  "type": "health"
}
```

**Response:**
```json
{
  "type": "health",
  "status": "healthy",
  "service": "VMC Mock Server",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

### Server → Client Messages

#### 1. **Initial Status (on connection)**
Sent automatically when a client connects.

```json
{
  "type": "status",
  "status": "idle",
  "items": []
}
```

#### 2. **Status Update (broadcast)**
Broadcasted to all connected clients when status changes.

```json
{
  "type": "status",
  "status": "vending",
  "items": [101, 202, 105],
  "message": "Vending started"
}
```

#### 3. **Vending Complete (broadcast)**
Broadcasted to all connected clients when vending completes.

```json
{
  "type": "vend-complete",
  "status": "idle",
  "message": "Vending completed successfully",
  "vendedItems": [101, 202, 105],
  "timestamp": "2025-11-11T10:30:05.000Z"
}
```

#### 4. **Error Messages**
```json
{
  "type": "error",
  "message": "Invalid JSON"
}
```

## Example Usage

### JavaScript/Node.js
```javascript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3002');

ws.on('open', () => {
  console.log('Connected to VMC server');
  
  // Request status
  ws.send(JSON.stringify({ type: 'status' }));
  
  // Trigger vending
  ws.send(JSON.stringify({
    type: 'vend',
    items: [101, 202, 105]
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### Python
```python
import asyncio
import websockets
import json

async def vmc_client():
    uri = "ws://localhost:3002"
    async with websockets.connect(uri) as websocket:
        # Request status
        await websocket.send(json.dumps({"type": "status"}))
        response = await websocket.recv()
        print(f"Status: {json.loads(response)}")
        
        # Trigger vending
        await websocket.send(json.dumps({
            "type": "vend",
            "items": [101, 202, 105]
        }))
        response = await websocket.recv()
        print(f"Vend response: {json.loads(response)}")

asyncio.run(vmc_client())
```

## Port Configuration

Default port is 3002. You can change it by setting the `PORT` environment variable:

```bash
PORT=3003 npm start
```

## Technical Details

- **Runtime**: Node.js with ES6 modules
- **Dependencies**: Express, WebSocket (ws), CORS
- **Vending Delay**: 5 seconds (5000ms)
- **State Management**: In-memory state tracking
- **Broadcasting**: All status changes are broadcasted to all connected WebSocket clients
