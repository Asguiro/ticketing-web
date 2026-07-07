import { Loader2, UserPlus } from "lucide-react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/Button";

export function TicketSelfAssignButton() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 via-primary/4 to-transparent p-5 transition-all duration-300 hover:border-primary/35 hover:shadow-md">
      <input type="hidden" name="intent" value="assign" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-105">
            <UserPlus className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-base-content">Prendre en charge</p>
            <p className="text-sm leading-relaxed text-base-content/65">
              Ce ticket est disponible dans le pool. Assignez-le à vous-même pour
              répondre au client et faire évoluer son statut.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Assignation…
            </>
          ) : (
            <>
              M&apos;attribuer
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </>
          )}
        </Button>
      </div>
    </fetcher.Form>
  );
}
