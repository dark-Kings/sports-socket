import { Wifi, WifiOff, LoaderCircle } from "lucide-react";

type Status = "connecting" | "connected" | "disconnected";

export function ConnectionBadge({ status }: { status: Status }) {
  const label = status === "connected"
    ? "LIVE CONNECTED"
    : status === "connecting"
      ? "CONNECTING"
      : "RECONNECTING";

  return (
    <span className={`connection-badge ${status}`}>
      {status === "connected" ? <Wifi size={14} /> :
        status === "connecting" ? <LoaderCircle className="spin" size={14} /> :
          <WifiOff size={14} />}
      {label}
    </span>
  );
}