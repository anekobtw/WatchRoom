import asyncio
import json
import time

import httpx
import websockets

BASE_URL = "http://localhost:8080"
WS_URL = "ws://localhost:8080/ws"

USER_COUNT = 5000
DURATION = 15
CHAT_INTERVAL = 0.1
UPDATE_INTERVAL = 0.1


def create_user():
    response = httpx.post(f"{BASE_URL}/api/users/create")
    response.raise_for_status()
    return response.text.strip()


def create_room(user_id):
    response = httpx.post(
        f"{BASE_URL}/api/rooms/create",
        json={"userId": user_id},
    )
    response.raise_for_status()
    return response.text.strip()


async def connect(ws, room_id, user_id):
    await ws.send(
        json.dumps(
            {
                "type": "CONNECT",
                "data": {
                    "roomId": room_id,
                    "userId": user_id,
                    "userName": "Load Test User",
                },
            }
        )
    )


async def open_connection(room_id, user_id):
    ws = await websockets.connect(
        WS_URL,
        max_size=1024 * 1024,
    )

    await connect(ws, room_id, user_id)

    return ws


async def send_chat(ws, index):
    await ws.send(
        json.dumps(
            {
                "type": "CHAT",
                "data": {
                    "text": f"load-{index}",
                },
            }
        )
    )


async def send_update(ws, index):
    await ws.send(
        json.dumps(
            {
                "type": "UPDATE",
                "data": {
                    "videoTimestamp": index,
                    "playing": index % 2 == 0,
                },
            }
        )
    )


def test_1000_users_sustained_load():
    admin = create_user()
    room_id = create_room(admin)

    users = [admin] + [
        create_user()
        for _ in range(USER_COUNT - 1)
    ]

    async def run():
        connections = []

        try:
            start = time.monotonic()

            connections = await asyncio.gather(
                *(
                    open_connection(room_id, user_id)
                    for user_id in users
                )
            )

            connection_time = time.monotonic() - start

            assert len(connections) == USER_COUNT

            print(
                f"\nConnected {USER_COUNT} users "
                f"in {connection_time:.2f}s"
            )

            assert all(
                ws.state.name == "OPEN"
                for ws in connections
            )

            stop_at = time.monotonic() + DURATION

            chat_index = 0
            update_index = 0

            async def workload():
                nonlocal chat_index, update_index

                next_chat = time.monotonic()
                next_update = time.monotonic()

                while time.monotonic() < stop_at:
                    now = time.monotonic()
                    tasks = []

                    if now >= next_chat:
                        for i in range(0, USER_COUNT, 10):
                            tasks.append(
                                send_chat(
                                    connections[i],
                                    chat_index,
                                )
                            )
                            chat_index += 1

                        next_chat += CHAT_INTERVAL

                    if now >= next_update:
                        tasks.append(
                            send_update(
                                connections[0],
                                update_index,
                            )
                        )
                        update_index += 1
                        next_update += UPDATE_INTERVAL

                    if tasks:
                        await asyncio.gather(*tasks)

                    await asyncio.sleep(0.01)

            await workload()

            print(
                f"Sent {chat_index} chat messages "
                f"and {update_index} updates"
            )

            await asyncio.sleep(2)

            open_connections = sum(
                ws.state.name == "OPEN"
                for ws in connections
            )

            print(
                f"Open connections after load: "
                f"{open_connections}/{USER_COUNT}"
            )

            assert open_connections == USER_COUNT

        finally:
            await asyncio.gather(
                *(ws.close() for ws in connections),
                return_exceptions=True,
            )

    asyncio.run(run())

