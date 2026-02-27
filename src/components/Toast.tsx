import { useEffect } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === "success" ? "#27ae60" : "#e74c3c";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: bgColor,
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "13px",
        fontFamily: "inherit",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 1000,
        maxWidth: "400px",
        textAlign: "center",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
      }}
    >
      {message}
    </div>
  );
}
