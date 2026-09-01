import { getUserId, setUserId } from "@/scripts/userId";

function requireResponseBody(operation: string, response: Response, body: string) {
  const value = body.trim();

  if (!response.ok || !value) {
    throw new Error(`Failed to ${operation}`);
  }

  return value;
}

export async function ensureUserId(): Promise<string> {
  const existingUserId = getUserId().trim();

  if (existingUserId) {
    return existingUserId;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_HTTP_URL}/api/users/create`, {
      method: "POST",
    });
    const userId = requireResponseBody("ensure user identity", response, await response.text());

    setUserId(userId);
    return userId;
  } catch {
    throw new Error("Failed to ensure user identity");
  }
}

export async function createRoom(userId: string): Promise<string> {
  try {
    const response = await fetch(`${import.meta.env.VITE_HTTP_URL}/api/rooms/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    return requireResponseBody("create room", response, await response.text());
  } catch {
    throw new Error("Failed to create room");
  }
}
