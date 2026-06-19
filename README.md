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
  "type": "LEAVE"
}
```

**SET_STATE:**

It changes the state of the room. Can be used to play/pause/change videoTimestamp

```json
{
    "type": "SET_STATE",
    "videoUrl": "https://youtube.com/...",
    "videoTimestamp": 300
    "playing": false
}
```

**CHAT:**

Sends a message to the chat.

```json
{
    "type": "CHAT",
    "text": "A message goes here",
    "ts": 1781868416
}
```



