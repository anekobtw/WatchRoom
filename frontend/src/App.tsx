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
    return <div className="min-h-screen">{children}</div>;
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

  return (
    <div className="min-h-screen bg-background text-primary">
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
