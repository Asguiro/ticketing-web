import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="alert alert-warning mb-4 py-2 text-sm shadow-sm"
      role="status"
    >
      <WifiOff className="size-4 shrink-0" />
      <span>
        Vous êtes hors ligne. Certaines actions pourront échouer jusqu&apos;au
        retour de la connexion.
      </span>
    </div>
  );
}
