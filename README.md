# WatchRoom

# connection

# http requests

**POST /api/users/create**

first, we need to get the userId (it's something similar to jwt token and used for indentifying the users).

the endpoint returns a random uuid string which is our userId

**POST /api/rooms/create**

takes `userId` as arugment and creates a room, assigning this userId as adminId (like a owner of the room) 

# websocket requests

Connections are listened on `ws://localhost:8080/ws`

### Message format

All messages follow this structure:

```json
{
  "type": "STRING",
  "data": {}
}
```

**CONNECT**

Connects the user to the room. Basically it is needed for the server to link the current websocket session to the userId provided. Later when sending other requests, there is no longer a need for providing userId.

```json
{
  "type": "CONNECT",
  "data": {
    "roomId": "A1B2C3",
    "userId": "710c2ff0-aa78-49b4-adde-9a9971f64535",
  }
}
```

**UPDATE** (Admin only)

Changes the state of the room. A user must be admin (creator) of the room to do it. This is used primarily when changin video, seeking, or hitting play button.

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

**CHAT**

Send a chat message.

```json
{
  "type": "CHAT",
  "data": {
    "text": "hello",
  }
}
```

**LEAVE**

Leaves the room.

```json
{
  "type": "LEAVE"
}
```

