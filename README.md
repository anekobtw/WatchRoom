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

**LEAVE:**

Leaves the room.

```json
{
    "type": "LEAVE",
    "roomId": "abc123",
}
```

**SET_STATE:**

It changes the state of the room. Can be used to play/pause/change videoTimestamp

```json
{
    "type": "SET_STATE",
    "roomId": "abc12",
    "playing": false,
    "videoTimestamp": 300
}
```

