"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

import { saveAlternativeEvaluationsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface EvaluationFormProps {
  children: React.ReactNode;
}

export function EvaluationForm({ children }: EvaluationFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveAlternativeEvaluationsAction,
    { success: false }
  );

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state.success || state.error) {
      const startTimer = setTimeout(() => setShowMessage(true), 0);
      const endTimer = setTimeout(() => setShowMessage(false), 5000);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, [state]);

  return (
    <>
      <form action={formAction} className="space-y-4">
        {children}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Penilaian"}
        </Button>
      </form>

      {showMessage && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {state.success && (
            <div className="pointer-events-auto flex w-80 items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg animate-in slide-in-from-top-5 fade-in duration-300 dark:border-green-400/40 dark:bg-green-500/10">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-300" />
              <div className="flex-1">
                <p className="font-semibold text-green-800 dark:text-green-200">Berhasil!</p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-100">Penilaian berhasil disimpan.</p>
              </div>
              <button onClick={() => setShowMessage(false)} className="text-green-500 transition-colors hover:text-green-700 dark:text-green-300 dark:hover:text-green-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {state.error && (
            <div className="pointer-events-auto flex w-80 items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg animate-in slide-in-from-top-5 fade-in duration-300 dark:border-red-400/40 dark:bg-red-500/10">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-200">Gagal Disimpan</p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-100">{state.error}</p>
              </div>
              <button onClick={() => setShowMessage(false)} className="text-red-500 transition-colors hover:text-red-700 dark:text-red-300 dark:hover:text-red-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
