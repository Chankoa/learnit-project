"use client";

import { useEffect, useRef } from "react";

import { loginAction } from "@/app/auth/actions";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const reset = () => formRef.current?.reset();

    reset();
    window.addEventListener("pageshow", reset);

    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <form action={loginAction} autoComplete="off" className="auth-form" ref={formRef}>
      <input name="next" type="hidden" value={nextPath} />
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="off" required />
      </label>
      <label>
        <span>Mot de passe</span>
        <input name="password" type="password" autoComplete="new-password" required />
      </label>
      <button className="btn btn-primary" type="submit">
        Se connecter
      </button>
    </form>
  );
}