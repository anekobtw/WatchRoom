import { useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "@/components/Modal";
import { getUserName, setUserName } from "@/scripts/userName";
import { RoomProvider } from "./RoomContext";
import RoomLayout from "./RoomLayout";

export default function Room() {
  const { id } = useParams();
  const [userName, setUserNameState] = useState(getUserName());
  const [name, setName] = useState(userName ?? "");

  return (
    <>
      {userName ? (
        <RoomProvider id={id}>
          <RoomLayout />
        </RoomProvider>
      ) : (
        <Modal>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();

              const trimmed = name.trim();
              if (!trimmed) return;

              setUserName(trimmed);
              setUserNameState(trimmed);
            }}
          >
            <h2 className="text-xl font-semibold">What's your name?</h2>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-md border border-border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="w-full cursor-pointer rounded-md bg-background py-2 font-medium text-primary transition duration-200 hover:bg-surface-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!name.trim()}
            >
              Continue
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
