import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home/page";
import Room from "./pages/Room/page";
import CreateRoom from "./pages/CreateRoom/page";
import Navbar from "./Navbar";

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Page>
                <Navbar />
                <Home />
              </Page>
            }
          />

          <Route
            path="/create-room"
            element={
              <Page>
                <CreateRoom />
              </Page>
            }
          />

          <Route
            path="/room/:id"
            element={
              <Page>
                <Room />
              </Page>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
