# WatchRoom

WatchRoom is a real-time watch-together platform that lets people create private rooms, invite others, synchronize playback, and communicate while watching the same content. The application uses a React frontend with Bun and Vite, a Spring Boot backend, WebSockets for real-time synchronization, and PostgreSQL for persistent data.

# Tech stack
### Frontend
React, TypeScript, Vite, Bun, Tailwind CSS, React Router, Lucide React, QRCode

### Backend
Java, Spring Boot, Spring Web, Spring WebSocket, Spring Data JPA, Hibernate, Gradle

### Infrastructure
PostgreSQL, Docker, Nginx, Cloudflare, VPS deployment

# Security consideration

WatchRoom currently uses generated user identifiers rather than a traditional account authentication system.

For a public production deployment, additional security mechanisms may be appropriate: Rate limiting, WebSocket connection limits, Room expiration, Input validation, Message size limits, Abuse prevention, HTTPS/WSS, Database connection security, Server-side validation of room membership

Room IDs should not be treated as authentication credentials.

# License
The project is under MIT license.

# Connection

WatchRoom uses HTTP endpoints for initial user and room creation, then a WebSocket connection for real-time room communication.

## HTTP API

`POST /api/users/create`

First, we need to get the `userId` (it's something similar to jwt token and used for indentifying the users). The endpoint returns a random uuid string which is our `userId`. Although this works similar to jwt tokens, it MUST NOT be used for authentication and the main purpose of `userId` is to distinguish users in the same rooms. When reconnecting or creating a new WebSocket connection, a new WebSocket session is created every time, so it's a way of remembering who is who.

Example response:

```
710c2ff0-aa78-49b4-adde-9a9971f64535
```

`POST /api/rooms/create`

Requires `userId` as arugment and creates a room, assigning provided `userId` as `adminId` (like a owner of the room) 

## WebSocket requests

Connections are listened on `ws://localhost:8080/ws`. In production, that must be `wss://`.

### Message format

All messages follow this structure:

```json
{
  "type": "STRING",
  "data": {}
}
```

`type` determines the operation being performed, while `data` contains the operation-specific payload.

`CONNECT`

Connects the user to the room. This must be the first message sent after the WebSocket connection is established. Basically, it's needed for the server to link the current WebSocket session that the user has to the `userId` provided. Later, when the user sends requests, there will be no need for providing `userId`.

Example:

```json
{
  "type": "CONNECT",
  "data": {
    "roomId": "A1B2C3",
    "userId": "710c2ff0-aa78-49b4-adde-9a9971f64535",
  }
}
```

`UPDATE`

Updates the current state of the room. A user must be admin (creator) of the room to perform the operation. This is used primarily for changing video, seeking, playing, pausing.

Example:

```json
{
  "type": "UPDATE",
  "data": {
    "videoUrl": "https://example.com/video",
    "videoTimestamp": 120,
    "playing": true
  }
}
```

`CHAT`

Send a chat message. Unlike `UPDATE`, this message does not require admin privileges and will send a new state with only updated messages so that new messages don't update the web player.

Example:

```json
{
  "type": "CHAT",
  "data": {
    "text": "hello",
  }
}
```

`LEAVE`

Leaves the room. The client does not need to provide neither `userId` nor `roomId`, because both are already associated with the WebSocket session.

Example:

```json
{
  "type": "LEAVE"
}
```
