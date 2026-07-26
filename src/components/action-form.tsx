"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

interface ActionFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> {
  action: (prevState: unknown, formData: FormData) => Promise<{ success?: boolean; message?: string; error?: string }>;
  onSuccess?: () => void;
}

export function ActionForm({ action, onSuccess, children, ...props }: ActionFormProps) {
  const [state, formAction] = useActionState(action, { success: false });

  useEffect(() => {
    if (state.success) {
      toast.success("Berhasil!", {
        description: state.message || "Aksi berhasil dilakukan.",
      });
      if (onSuccess) {
        onSuccess();
      }
    } else if (state.error) {
      toast.error("Terjadi Kesalahan", {
        description: state.error,
      });
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} {...props}>
      {children}
    </form>
  );
}
