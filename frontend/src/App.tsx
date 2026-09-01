import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home/page";
import Room from "./pages/Room/page";
import JoinRoom from "./pages/JoinRoom/page";
import NotFound from "./pages/NotFound/page";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Page({
  children,
  animated = true,
}: {
  children: React.ReactNode;
  animated?: boolean;
}) {
  if (!animated) {
    return <div className="h-full">{children}</div>;
  }

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
  const isRoomRoute = location.pathname.startsWith("/room/");
  const isPrimaryBackground =
    location.pathname !== "/" && location.pathname !== "/join-room";
  const viewportBackground = isPrimaryBackground
    ? "var(--primary)"
    : "var(--background)";

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--viewport-background", viewportBackground);

    return () => {
      root.style.removeProperty("--viewport-background");
    };
  }, [viewportBackground]);


  return (
    <div
      className={`${isRoomRoute ? "h-dvh" : "min-h-screen"} overflow-hidden ${
        isPrimaryBackground
          ? "bg-primary text-background"
          : "bg-background text-primary"
      }`}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Page>
                <Navbar />
                <Home />
                <Footer />
              </Page>
            }
          />

          <Route
            path="/join-room"
            element={
              <Page>
                <JoinRoom />
              </Page>
            }
          />

          <Route
            path="/room/:id"
            element={
              <Page animated={false}>
                <Room />
              </Page>
            }
          />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
