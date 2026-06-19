import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/page";
import Room from "./pages/Room/page";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </div>
  );
}
