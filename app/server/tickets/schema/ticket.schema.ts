import type { TicketPriority } from "~/types/ticket";
import { MIN_DESCRIPTION_LENGTH } from "~/lib/ticket-validation";

export type FieldErrors = Record<string, string>;

export { MIN_DESCRIPTION_LENGTH };

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };

const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];

function requiredString(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) {
    return { ok: false as const, error: `${field} est requis.` };
  }
  return { ok: true as const, value: str };
}

export function parseCreateTicketFormData(formData: FormData): ParseResult<{
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}> {
  const errors: FieldErrors = {};

  const title = requiredString(formData.get("title"), "Titre");
  const description = requiredString(formData.get("description"), "Description");
  const category = requiredString(formData.get("category"), "Catégorie");
  const priorityRaw = String(formData.get("priority") ?? "").trim();

  if (!title.ok) errors.title = title.error;
  if (!description.ok) {
    errors.description = description.error;
  } else if (description.value.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères.`;
  }
  if (!category.ok) errors.category = category.error;

  if (!PRIORITIES.includes(priorityRaw as TicketPriority)) {
    errors.priority = "Priorité invalide.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title: (title as { ok: true; value: string }).value,
      description: (description as { ok: true; value: string }).value,
      category: (category as { ok: true; value: string }).value,
      priority: priorityRaw as TicketPriority,
    },
  };
}

export type TicketDetailFormData =
  | { intent: "send-message"; payload: { content: string } }
  | { intent: "change-status"; payload: { status: string } }
  | { intent: "assign"; payload: { agentId?: string } };

export function parseTicketDetailFormData(
  formData: FormData,
): ParseResult<TicketDetailFormData> {
  const intent = String(formData.get("intent") ?? "");

  if (intent === "send-message") {
    const content = requiredString(formData.get("content"), "Message");
    if (!content.ok) {
      return { success: false, errors: { content: content.error } };
    }
    return {
      success: true,
      data: { intent, payload: { content: content.value! } },
    };
  }

  if (intent === "change-status") {
    const status = requiredString(formData.get("status"), "Statut");
    if (!status.ok) {
      return { success: false, errors: { status: status.error } };
    }
    return {
      success: true,
      data: { intent, payload: { status: status.value! } },
    };
  }

  if (intent === "assign") {
    const hasAgentField = formData.has("agentId");
    const agentId = hasAgentField
      ? String(formData.get("agentId") ?? "").trim()
      : undefined;

    if (hasAgentField && !agentId) {
      return { success: false, errors: { agentId: "Agent est requis." } };
    }

    return {
      success: true,
      data: {
        intent,
        payload: agentId ? { agentId } : {},
      },
    };
  }

  return {
    success: false,
    errors: { intent: "Action inconnue." },
  };
}
