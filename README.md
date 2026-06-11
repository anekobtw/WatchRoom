# SyncView

# websocket requests

Connections are listened on `ws://localhost:8080/ws`

**JOIN:**

Joins the room. If the room with roomId doesn't exist, the room is created.

```json
{
  "type": "JOIN",
  "roomId": "abc123"
}
```

**PLAY:**

Updates `playing` column in database to `false`

```
{
    "type": "PLAY",
    "roomId": "abc123",
    "videoTimestamp": 300
}
```

**PAUSE:**

Updates `playing` column in database to `true`

```
{
    "type": "PAUSE",
    "roomId": "abc12",
    "videoTimestamp": 300
}
```

