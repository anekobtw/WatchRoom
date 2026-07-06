# WatchRoom

# connection

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

**JOIN**

Joins the room. If the room with roomId doesn't exist, the room is created.

```json
{
  "type": "JOIN",
  "data": {
    "roomId": "room123",
    "clientId": "710c2ff0-aa78-49b4-adde-9a9971f64535",
    "rawPassword": "1234"
  }
}
```

**UPDATE** (Admin only)

It changes the state of the room.

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

