import { useParams } from "react-router-dom";
import { useRoomWS } from "./useRoomWS";

export default function Room() {
  const { id } = useParams();
  const wsRef = useRoomWS(id);

  return (
    <div>
      Room: {id}
      <br />
      Url: {wsRef.current?.url}
    </div>
  );
}
