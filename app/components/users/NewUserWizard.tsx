import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  Shield,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { ROLE_LABELS } from "~/lib/roles";
import type { Role } from "~/types/user";

const STEPS = [
  {
    id: 1,
    title: "Identité",
    description: "Adresse email du compte",
    icon: UserRound,
  },
  {
    id: 2,
    title: "Sécurité",
    description: "Mot de passe initial",
    icon: KeyRound,
  },
  {
    id: 3,
    title: "Rôle",
    description: "Droits d'accès",
    icon: Shield,
  },
] as const;

const SUBMIT_READY_DELAY_MS = 400;

const ROLES: Array<{
  value: Role;
  label: string;
  description: string;
  tone: string;
}> = [
  {
    value: "CLIENT",
    label: ROLE_LABELS.CLIENT,
    description: "Crée et suit uniquement ses propres tickets.",
    tone: "border-info/30 bg-info/5 hover:border-info/60",
  },
  {
    value: "AGENT",
    label: ROLE_LABELS.AGENT,
    description: "Traite les tickets assignés et échange avec les clients.",
    tone: "border-secondary/30 bg-secondary/5 hover:border-secondary/60",
  },
  {
    value: "ADMIN",
    label: ROLE_LABELS.ADMIN,
    description: "Supervise l'activité, assigne les tickets et gère les comptes.",
    tone: "border-primary/30 bg-primary/5 hover:border-primary/60",
  },
];

type FieldErrors = Partial<Record<"email" | "password" | "role", string>>;

type NewUserWizardProps = {
  errors?: FieldErrors;
  globalError?: string;
};

function stepFromErrors(errors?: FieldErrors): number {
  if (!errors) return 1;
  if (errors.email) return 1;
  if (errors.password) return 2;
  if (errors.role) return 3;
  return 1;
}

function validateStep(
  stepNumber: number,
  values: { email: string; password: string; role: Role },
): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (stepNumber === 1) {
    if (!values.email.trim()) {
      nextErrors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Format d'email invalide.";
    }
  }

  if (stepNumber === 2) {
    if (!values.password) {
      nextErrors.password = "Le mot de passe est requis.";
    } else if (values.password.length < 8) {
      nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }
  }

  if (stepNumber === 3) {
    if (!ROLES.some((item) => item.value === values.role)) {
      nextErrors.role = "Rôle invalide.";
    }
  }

  return nextErrors;
}

export function NewUserWizard({ errors, globalError }: NewUserWizardProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const advancingRef = useRef(false);

  const [step, setStep] = useState(() => stepFromErrors(errors));
  const [submitReady, setSubmitReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const formValues = { email, password, role };

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
    if (advancingRef.current) return;
    if (!validateCurrentStep()) return;

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

  function handleCreateUser() {
    if (step !== STEPS.length || !submitReady) return;
    if (!validateAllSteps()) return;

    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("role", role);

    fetcher.submit(formData, { method: "post" });
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || step >= STEPS.length) return;
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

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-base-300/60 bg-base-200/40 px-6 py-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Étape {step} sur {STEPS.length}
          </p>
          <h2 className="mt-1 text-xl font-bold">{activeStep.title}</h2>
          <p className="mt-1 text-sm text-base-content/60">{activeStep.description}</p>
        </div>

        {displayedGlobalError ? (
          <div className="mx-6 mt-6 rounded-box border border-error/20 bg-error/10 px-4 py-3 text-sm text-error sm:mx-8">
            {displayedGlobalError}
          </div>
        ) : null}

        <div className="px-6 py-8 sm:px-8" onKeyDown={handlePanelKeyDown}>
          {step === 1 ? (
            <div className="space-y-6">
              <Input
                label="Adresse email"
                type="email"
                placeholder="Ex. : marie.dupont@entreprise.fr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldErrors.email}
                autoComplete="email"
              />
              <div className="rounded-box border border-info/20 bg-info/5 px-4 py-3 text-sm text-base-content/70">
                Cette adresse servira d&apos;identifiant de connexion pour le
                compte.
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <Input
                label="Mot de passe initial"
                type="password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={fieldErrors.password}
                autoComplete="new-password"
              />
              <div className="rounded-box border border-base-300/70 bg-base-200/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/50">
                  Recommandations
                </p>
                <ul className="mt-3 space-y-1 text-sm text-base-content/70">
                  <li>Au moins 8 caractères</li>
                  <li>Communiquez le mot de passe de façon sécurisée</li>
                  <li>L&apos;utilisateur pourra le modifier ultérieurement</li>
                </ul>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-base-content">
                  Type de compte
                </legend>
                <div className="grid gap-3">
                  {ROLES.map((item) => {
                    const isSelected = role === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setRole(item.value)}
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
                {fieldErrors.role ? (
                  <p className="text-sm text-error">{fieldErrors.role}</p>
                ) : null}
              </fieldset>

              <div className="rounded-box border border-base-300/70 bg-base-200/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/50">
                  Récapitulatif
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-base-content/60">Email</dt>
                    <dd className="font-medium sm:max-w-[60%] sm:text-right">
                      {email || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-base-content/60">Rôle</dt>
                    <dd className="font-medium sm:text-right">
                      {ROLES.find((item) => item.value === role)?.label}
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
                onClick={handleCreateUser}
                disabled={isSubmitting || !submitReady}
                className="gap-2 sm:min-w-44"
              >
                {isSubmitting ? "Création..." : "Créer l'utilisateur"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
