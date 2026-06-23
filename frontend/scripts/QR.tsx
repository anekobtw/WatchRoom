import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QR({ value }: { value: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ref.current || !value) return;

    QRCode.toCanvas(ref.current, value, {
      width: 200,
      margin: 1,
    });
  }, [value]);

  return <canvas ref={ref} />;
}
