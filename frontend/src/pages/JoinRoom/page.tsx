import { setConnectionToken } from "@/scripts/connectionToken";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CODE_LENGTH = 6;

export default function JoinRoom() {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  function handleChange(value: string, idx: number) {
    const char = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(-1);

    const next = [...code];
    next[idx] = char;
    setCode(next);

    if (char && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const finalCode = code.join("");
    if (finalCode.length !== CODE_LENGTH) return;

    const response = await fetch(import.meta.env.VITE_HTTP_URL + "/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: finalCode,
      }),
    });

    if (response.status != 200) return;

    const data = await response.json();
    setConnectionToken(data.connectionId);

    navigate(`/room/${data.roomId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-mulish">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-8 w-full px-4"
      >
        <div className="text-center">
          <h1 className="text-4xl font-title font-bold text-primary">
            Join Room
          </h1>
          <h3 className="text-xm text-primary/60">
            Please, write below the code that your friend has sent you.
          </h3>
        </div>

        <div className="flex gap-3">
          {code.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              value={val}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-14 text-center text-xl rounded-lg border border-border bg-transparent text-primary outline-none focus:border-primary"
              maxLength={1}
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-3.5 font-semibold text-background hover:bg-primary-hover transition duration-200 cursor-pointer max-w-md"
        >
          Join
        </button>
      </form>
    </div>
  );
}
