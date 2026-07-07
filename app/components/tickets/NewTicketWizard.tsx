import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Flag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
import { Textarea } from "~/components/ui/Textarea";
import { MIN_DESCRIPTION_LENGTH } from "~/lib/ticket-validation";
import type { TicketPriority } from "~/types/ticket";

const STEPS = [
  {
    id: 1,
    title: "Sujet",
    description: "Identifiez votre demande",
    icon: FileText,
  },
  {
    id: 2,
    title: "Détails",
    description: "Décrivez le problème",
    icon: AlignLeft,
  },
  {
    id: 3,
    title: "Priorité",
    description: "Choisissez l'urgence",
    icon: Flag,
  },
] as const;

const SUBMIT_READY_DELAY_MS = 400;

const CATEGORIES = [
  { value: "Authentification", label: "Authentification" },
  { value: "Facturation", label: "Facturation" },
  { value: "Interface", label: "Interface" },
  { value: "Comptes", label: "Comptes" },
  { value: "Autre", label: "Autre" },
];

const PRIORITIES: Array<{
  value: TicketPriority;
  label: string;
  description: string;
  tone: string;
}> = [
  {
    value: "LOW",
    label: "Basse",
    description: "Question générale, pas de blocage",
    tone: "border-success/30 bg-success/5 hover:border-success/60",
  },
  {
    value: "MEDIUM",
    label: "Moyenne",
    description: "Gêne modérée sur l'utilisation",
    tone: "border-warning/30 bg-warning/5 hover:border-warning/60",
  },
  {
    value: "HIGH",
    label: "Haute",
    description: "Blocage critique ou impact fort",
    tone: "border-error/30 bg-error/5 hover:border-error/60",
  },
];

type FieldErrors = Partial<
  Record<"title" | "description" | "category" | "priority", string>
>;

type NewTicketWizardProps = {
  errors?: FieldErrors;
  globalError?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    category?: string;
    priority?: TicketPriority;
  };
};

function stepFromErrors(errors?: FieldErrors): number {
  if (!errors) return 1;
  if (errors.title || errors.category) return 1;
  if (errors.description) return 2;
  if (errors.priority) return 3;
  return 1;
}

function validateStep(
  stepNumber: number,
  values: {
    title: string;
    category: string;
    description: string;
    priority: TicketPriority;
  },
): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (stepNumber === 1) {
    if (!values.title.trim()) nextErrors.title = "Le titre est requis.";
    if (!values.category.trim()) nextErrors.category = "La catégorie est requise.";
  }

  if (stepNumber === 2) {
    if (!values.description.trim()) {
      nextErrors.description = "La description est requise.";
    } else if (values.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      nextErrors.description = `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères.`;
    }
  }

  if (stepNumber === 3) {
    if (!PRIORITIES.some((item) => item.value === values.priority)) {
      nextErrors.priority = "Priorité invalide.";
    }
  }

  return nextErrors;
}

export function NewTicketWizard({
  errors,
  globalError,
  defaultValues,
}: NewTicketWizardProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const advancingRef = useRef(false);

  const [step, setStep] = useState(() => stepFromErrors(errors));
  const [submitReady, setSubmitReady] = useState(false);
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [category, setCategory] = useState(
    defaultValues?.category ?? CATEGORIES[0].value,
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [priority, setPriority] = useState<TicketPriority>(
    defaultValues?.priority ?? "MEDIUM",
  );
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const formValues = { title, category, description, priority };

  const fetcherErrors =
    fetcher.data && typeof fetcher.data === "object" && "errors" in fetcher.data
      ? (fetcher.data.errors as FieldErrors)
      : undefined;
  const fetcherGlobalError =
    fetcher.data && typeof fetcher.data === "object" && "error" in fetcher.data
      ? String(fetcher.data.error)
      : undefined;

  useEffect(() => {
    const mergedErrors = fetcherErrors ?? errors;
    if (mergedErrors) {
      setStep(stepFromErrors(mergedErrors));
    }
  }, [errors, fetcherErrors]);

  useEffect(() => {
    if (step !== 3) {
      setSubmitReady(false);
      return;
    }

    setSubmitReady(false);
    const timer = window.setTimeout(() => {
      setSubmitReady(true);
    }, SUBMIT_READY_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [step]);

  const activeStep = STEPS[step - 1];

  function validateCurrentStep(): boolean {
    const nextErrors = validateStep(step, formValues);
    setClientErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateAllSteps(): boolean {
    for (let stepNumber = 1; stepNumber <= STEPS.length; stepNumber += 1) {
      const stepErrors = validateStep(stepNumber, formValues);
      if (Object.keys(stepErrors).length > 0) {
        setClientErrors(stepErrors);
        setStep(stepNumber);
        return false;
      }
    }

    setClientErrors({});
    return true;
  }

  function goNext() {
    if (advancingRef.current) {
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    advancingRef.current = true;
    window.setTimeout(() => {
      advancingRef.current = false;
    }, SUBMIT_READY_DELAY_MS);

    setClientErrors({});
    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function goBack() {
    setClientErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  function handleCreateTicket() {
    if (step !== STEPS.length || !submitReady) {
      return;
    }

    if (!validateAllSteps()) {
      return;
    }

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("category", category.trim());
    formData.set("description", description.trim());
    formData.set("priority", priority);

    fetcher.submit(formData, { method: "post" });
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || step >= STEPS.length) {
      return;
    }

    if (event.target instanceof HTMLTextAreaElement) {
      return;
    }

    event.preventDefault();
    goNext();
  }

  const fieldErrors = { ...clientErrors, ...errors, ...fetcherErrors };
  const displayedGlobalError = fetcherGlobalError ?? globalError;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="mb-8 grid grid-cols-3 gap-3">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const isActive = step === item.id;
          const isDone = step > item.id;

          return (
            <li key={item.id} className="relative">
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute left-[calc(50%+1.25rem)] top-5 hidden h-0.5 w-[calc(100%-2.5rem)] sm:block ${
                    isDone ? "bg-primary" : "bg-base-300"
                  }`}
                />
              ) : null}
              <div
                className={`relative flex flex-col items-center rounded-box border px-3 py-4 text-center transition ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : isDone
                      ? "border-primary/30 bg-base-100"
                      : "border-base-300/70 bg-base-100"
                }`}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : isDone
                        ? "bg-primary/15 text-primary"
                        : "bg-base-200 text-base-content/50"
                  }`}
                >
                  {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 hidden text-xs text-base-content/60 sm:block">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="panel-section overflow-hidden">
        <div className="panel-section-header bg-base-200/40">
          <p className="text-col-header text-primary">
            Étape {step} sur {STEPS.length}
          </p>
          <h2 className="mt-1 text-page-title">{activeStep.title}</h2>
          <p className="mt-1 text-page-desc">{activeStep.description}</p>
        </div>

        {displayedGlobalError ? (
          <div className="mx-6 mt-6 rounded-box border border-error/20 bg-error/10 px-4 py-3 text-sm text-error sm:mx-8">
            {displayedGlobalError}
          </div>
        ) : null}

        <div
          className="px-6 py-8 sm:px-8"
          onKeyDown={handlePanelKeyDown}
        >
          {step === 1 ? (
            <div className="space-y-6">
              <Input
                label="Titre de la demande"
                placeholder="Ex. : Impossible de réinitialiser mon mot de passe"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                error={fieldErrors.title}
              />
              <Select
                label="Catégorie"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                error={fieldErrors.category}
                options={CATEGORIES}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <Textarea
                label="Description détaillée"
                placeholder="Expliquez le contexte, les étapes déjà tentées et le comportement attendu..."
                rows={8}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                error={fieldErrors.description}
                className="min-h-40"
              />
              <div className="rounded-box border border-info/20 bg-info/5 px-4 py-3 text-sm text-base-content/70">
                Plus votre description est précise, plus l&apos;équipe support
                pourra vous aider rapidement. Minimum {MIN_DESCRIPTION_LENGTH}{" "}
                caractères.
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-base-content">
                  Niveau de priorité
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PRIORITIES.map((item) => {
                    const isSelected = priority === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setPriority(item.value)}
                        className={`rounded-box border p-4 text-left transition ${
                          isSelected
                            ? `${item.tone} ring-2 ring-primary/40`
                            : "border-base-300 bg-base-100 hover:border-base-content/20"
                        }`}
                      >
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs text-base-content/60">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.priority ? (
                  <p className="text-sm text-error">{fieldErrors.priority}</p>
                ) : null}
              </fieldset>

              <div className="rounded-box border border-base-300/70 bg-base-200/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/50">
                  Récapitulatif
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-base-content/60">Titre</dt>
                    <dd className="font-medium sm:max-w-[60%] sm:text-right">
                      {title || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-base-content/60">Catégorie</dt>
                    <dd className="font-medium sm:text-right">{category}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-base-content/60">Description</dt>
                    <dd className="mt-1 whitespace-pre-wrap rounded-box bg-base-100 px-3 py-2 text-base-content/80">
                      {description || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-base-content/60">Priorité</dt>
                    <dd className="font-medium sm:text-right">
                      {PRIORITIES.find((item) => item.value === priority)?.label}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-base-300/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 1 || isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Précédent
            </Button>

            {step < STEPS.length ? (
              <Button type="button" onClick={goNext} className="gap-2 sm:min-w-36">
                Suivant
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreateTicket}
                disabled={isSubmitting || !submitReady}
                className="gap-2 sm:min-w-44"
              >
                {isSubmitting ? "Création..." : "Créer le ticket"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
