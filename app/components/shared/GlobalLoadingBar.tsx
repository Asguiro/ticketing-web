import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

export function GlobalLoadingBar() {
  const navigation = useNavigation();
  const isBusy =
    navigation.state === "loading" || navigation.state === "submitting";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isBusy) {
      const timer = window.setTimeout(() => setVisible(true), 120);
      return () => window.clearTimeout(timer);
    }

    setVisible(false);
    return undefined;
  }, [isBusy]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10"
      role="progressbar"
      aria-label="Chargement en cours"
    >
      <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  );
}

export function NavigationLoadingIndicator() {
  const navigation = useNavigation();
  const isBusy =
    navigation.state === "loading" || navigation.state === "submitting";

  if (!isBusy) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-box bg-base-200/80 px-3 py-2 text-sm text-base-content/70">
      <span className="loading loading-spinner loading-xs text-primary" />
      Chargement des données...
    </div>
  );
}
