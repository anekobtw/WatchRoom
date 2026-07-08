import { useEffect, useState } from "react";

type Orientation = "horizontal" | "vertical";

export default function useOrientation(breakpoint = 767): Orientation {
  const getOrientation = (): Orientation =>
    window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      ? "vertical"
      : "horizontal";

  const [orientation, setOrientation] = useState<Orientation>(getOrientation);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const onChange = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? "vertical" : "horizontal");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [breakpoint]);

  return orientation;
}
