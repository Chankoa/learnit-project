"use client";

import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { ReactNode } from "react";

type ToastVariant = "danger" | "info" | "success" | "warning";

type ToastInput = {
  description?: string;
  duration?: number;
  title: string;
  variant?: ToastVariant;
};

type ToastItem = Required<Pick<ToastInput, "title" | "variant">> &
  Pick<ToastInput, "description"> & {
    id: string;
  };

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (toast: string | ToastInput) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const defaultToastDuration = 3600;

function getToastIcon(variant: ToastVariant) {
  const icons = {
    danger: XCircle,
    info: Info,
    success: CheckCircle2,
    warning: TriangleAlert
  };

  return icons[variant];
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIds = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutIds.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: string | ToastInput) => {
      const nextToast: ToastInput & { variant: ToastVariant } =
        typeof toast === "string"
          ? { title: toast, variant: "info" as const }
          : { variant: "info" as const, ...toast };
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}`;

      setToasts((current) => [...current, { ...nextToast, id }].slice(-4));

      if (nextToast.duration !== 0) {
        const timeoutId = window.setTimeout(
          () => dismissToast(id),
          nextToast.duration ?? defaultToastDuration
        );
        timeoutIds.current.set(id, timeoutId);
      }

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    const activeTimeoutIds = timeoutIds.current;

    return () => {
      activeTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      activeTimeoutIds.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      dismissToast,
      showToast
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.variant);

          return (
            <article
              className="toast"
              data-variant={toast.variant}
              key={toast.id}
              role={toast.variant === "danger" ? "alert" : "status"}
            >
              <span className="toast__icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <strong>{toast.title}</strong>
                {toast.description ? <p>{toast.description}</p> : null}
              </div>
              <button
                aria-label="Fermer la notification"
                type="button"
                onClick={() => dismissToast(toast.id)}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
