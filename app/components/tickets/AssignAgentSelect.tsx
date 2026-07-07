import { useFetcher } from "react-router";

import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import type { User } from "~/types/user";

type AssignAgentSelectProps = {
  agents: User[];
  currentAgentId?: string | null;
};

export function AssignAgentSelect({
  agents,
  currentAgentId,
}: AssignAgentSelectProps) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="intent" value="assign" />
      <Select
        name="agentId"
        label="Assigner à un agent"
        defaultValue={currentAgentId ?? ""}
        options={[
          { value: "", label: "Sélectionner un agent" },
          ...agents.map((agent) => ({
            value: agent.id,
            label: agent.email,
          })),
        ]}
      />
        <Button type="submit" disabled={fetcher.state !== "idle"} className="mb-0.5">
          Assigner
        </Button>
    </fetcher.Form>
  );
}
