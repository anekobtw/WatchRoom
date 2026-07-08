import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
  useEffect(() => {
    // Prevent keyboard dismissal (Escape key)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent dismissal when clicking the backdrop
    e.preventDefault();
  };

  return (
    <div
      className="fixed inset-0 bg-primary/70 text-background flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="bg-primary rounded-lg shadow-lg p-6 max-w-md w-11/12"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
