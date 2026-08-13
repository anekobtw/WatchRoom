import asyncio
import json
import uuid

import httpx
import pytest
import websockets

BASE_URL = "http://localhost:8080"
WS_URL = "ws://localhost:8080/ws"


def create_user():
    response = httpx.post(f"{BASE_URL}/api/users/create")

    assert response.status_code == 200

    user_id = response.text.strip()

    assert uuid.UUID(user_id)

    return user_id


def create_room(user_id):
    response = httpx.post(
        f"{BASE_URL}/api/rooms/create",
        json={"userId": user_id},
    )

    assert response.status_code == 200

    room_id = response.text.strip()

    assert len(room_id) == 6

    return room_id


async def connect(ws, room_id, user_id):
    await ws.send(
        json.dumps(
            {
                "type": "CONNECT",
                "data": {
                    "roomId": room_id,
                    "userId": user_id,
                    "userName": "Test User",
                },
            }
        )
    )


async def receive_state(ws):
    message = await asyncio.wait_for(ws.recv(), timeout=2)
    data = json.loads(message)

    assert data["type"] == "STATE"

    return data["data"]


@pytest.fixture
def user_id():
    return create_user()


@pytest.fixture
def room_id(user_id):
    return create_room(user_id)


def test_create_user():
    user1 = create_user()
    user2 = create_user()

    assert user1 != user2
    assert uuid.UUID(user1)
    assert uuid.UUID(user2)


def test_create_room(user_id):
    room_id = create_room(user_id)

    assert room_id
    assert len(room_id) == 6
    assert room_id.isalnum()
    assert room_id.isupper()


def test_connect(room_id, user_id):
    async def run():
        async with websockets.connect(WS_URL) as ws:
            await connect(ws, room_id, user_id)

    asyncio.run(run())


def test_connect_invalid_room(user_id):
    async def run():
        async with websockets.connect(WS_URL) as ws:
            await connect(ws, "XXXXXX", user_id)

            with pytest.raises(websockets.exceptions.ConnectionClosedOK):
                await ws.recv()

    asyncio.run(run())


def test_update(room_id, user_id):
    async def run():
        async with websockets.connect(WS_URL) as ws:
            await connect(ws, room_id, user_id)

            await ws.send(
                json.dumps(
                    {
                        "type": "UPDATE",
                        "data": {
                            "videoUrl": "https://example.com/video",
                            "videoTimestamp": 120,
                            "playing": True,
                        },
                    }
                )
            )

            state = await receive_state(ws)

            assert state["videoUrl"] == "https://example.com/video"
            assert state["videoTimestamp"] == 120
            assert state["playing"] is True
            assert state["updatedBy"] is not None

    asyncio.run(run())


def test_chat(room_id, user_id):
    async def run():
        async with websockets.connect(WS_URL) as ws:
            await connect(ws, room_id, user_id)

            await ws.send(
                json.dumps(
                    {
                        "type": "CHAT",
                        "data": {
                            "text": "hello",
                        },
                    }
                )
            )

            state = await receive_state(ws)

            assert len(state["messages"]) == 1

            message = state["messages"][0]

            assert message["userId"] == user_id
            assert message["text"] == "hello"
            assert message["userName"]
            assert message["ts"]

    asyncio.run(run())


def test_leave(room_id):
    user1 = create_user()
    user2 = create_user()

    async def run():
        async with (
            websockets.connect(WS_URL) as ws1,
            websockets.connect(WS_URL) as ws2,
        ):
            await connect(ws1, room_id, user1)
            await connect(ws2, room_id, user2)

            await asyncio.sleep(0.2)

            await ws1.send(
                json.dumps(
                    {
                        "type": "LEAVE",
                    }
                )
            )

            state = await receive_state(ws2)

            assert user1 not in state["users"]

    asyncio.run(run())


def test_two_users_receive_update():
    user1 = create_user()
    user2 = create_user()
    room_id = create_room(user1)

    async def receive_updated_state(ws):
        while True:
            message = await asyncio.wait_for(ws.recv(), timeout=5)
            data = json.loads(message)

            assert data["type"] == "STATE"

            state = data["data"]

            if state.get("videoUrl") == "https://example.com/video":
                return state

    async def run():
        async with (
            websockets.connect(WS_URL) as ws1,
            websockets.connect(WS_URL) as ws2,
        ):
            await connect(ws1, room_id, user1)
            await connect(ws2, room_id, user2)

            await asyncio.sleep(0.2)

            await ws1.send(
                json.dumps(
                    {
                        "type": "UPDATE",
                        "data": {
                            "videoUrl": "https://example.com/video",
                            "videoTimestamp": 120,
                            "playing": True,
                        },
                    }
                )
            )

            state1, state2 = await asyncio.gather(
                receive_updated_state(ws1),
                receive_updated_state(ws2),
            )

            assert state1["videoUrl"] == "https://example.com/video"
            assert state2["videoUrl"] == "https://example.com/video"

            assert state1["videoTimestamp"] == 120
            assert state2["videoTimestamp"] == 120

            assert state1["playing"] is True
            assert state2["playing"] is True

            assert state1["updatedBy"] is not None
            assert state2["updatedBy"] is not None

    asyncio.run(run())

def test_non_admin_cannot_update():
    admin = create_user()
    user = create_user()
    room_id = create_room(admin)

    async def receive_updated_state(ws):
        while True:
            message = await asyncio.wait_for(ws.recv(), timeout=5)
            data = json.loads(message)

            assert data["type"] == "STATE"

            state = data["data"]

            if state.get("videoTimestamp") == 50:
                return state

    async def run():
        async with (
            websockets.connect(WS_URL) as ws_admin,
            websockets.connect(WS_URL) as ws_user,
        ):
            await connect(ws_admin, room_id, admin)
            await connect(ws_user, room_id, user)

            await asyncio.sleep(0.2)

            await ws_user.send(
                json.dumps(
                    {
                        "type": "UPDATE",
                        "data": {
                            "videoUrl": "https://example.com/unauthorized",
                            "videoTimestamp": 100,
                            "playing": True,
                        },
                    }
                )
            )

            await asyncio.sleep(0.3)

            await ws_admin.send(
                json.dumps(
                    {
                        "type": "UPDATE",
                        "data": {
                            "videoTimestamp": 50,
                        },
                    }
                )
            )

            state = await receive_updated_state(ws_admin)

            assert state["videoTimestamp"] == 50
            assert state["videoUrl"] != "https://example.com/unauthorized"
            assert state["playing"] is not True

    asyncio.run(run())

def test_two_users_receive_chat():
    user1 = create_user()
    user2 = create_user()
    room_id = create_room(user1)

    async def receive_chat(ws):
        while True:
            state = await receive_state(ws)

            if state["messages"] and state["messages"][-1]["text"] == "hello":
                return state

    async def run():
        async with (
            websockets.connect(WS_URL) as ws1,
            websockets.connect(WS_URL) as ws2,
        ):
            await connect(ws1, room_id, user1)
            await connect(ws2, room_id, user2)

            await asyncio.sleep(0.2)

            await ws1.send(
                json.dumps(
                    {
                        "type": "CHAT",
                        "data": {
                            "text": "hello",
                        },
                    }
                )
            )

            state1, state2 = await asyncio.gather(
                receive_chat(ws1),
                receive_chat(ws2),
            )

            assert state1["messages"][-1]["text"] == "hello"
            assert state2["messages"][-1]["text"] == "hello"

            assert state1["messages"][-1]["userId"] == user1
            assert state2["messages"][-1]["userId"] == user1

    asyncio.run(run())
