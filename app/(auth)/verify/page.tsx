"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/app/utils/supabase_browser";

const OTP_LENGTH = 8;

export default function AuthenticatingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserSupabaseClient();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role") ?? "admin";

  const steps = [
    { id: "sent", label: <span>Verification code sent to <strong style={{ color: "var(--primary)" }}>{email}</strong></span> },
    { id: "waiting", label: "Waiting for code entry..." },
    { id: "verifying", label: "Applying access rules" },
    { id: "done", label: "Loading your workspace" },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusIdx, setFocusIdx] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => setCurrentStep(1), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 1 && !done) inputRef.current?.focus();
  }, [focusIdx, currentStep, done]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetOtp = useCallback(() => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setFocusIdx(0);
    setShakeKey((k) => k + 1);
    inputRef.current?.focus();
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      if (verifying || !email) return;

      setVerifying(true);
      setError("");
      setCurrentStep(2);

      const {
        data: { session },
        error: otpError,
      } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (otpError || !session) {
        setError(otpError?.message ?? "Invalid code. Please try again.");
        setVerifying(false);
        setCurrentStep(1);
        resetOtp();
        return;
      }

      const rpcName = role === "admin" ? "handle_admin_auth" : "handle_staff_auth";
      const { data: rpcResponse, error: rpcError } = await supabase.rpc(rpcName);

      if (rpcError) {
        setError("System error. Please try again.");
        setVerifying(false);
        setCurrentStep(1);
        resetOtp();
        return;
      }

      if (!rpcResponse.success) {
        await supabase.auth.signOut();
        router.push(`/${role}?error=${encodeURIComponent(rpcResponse.message)}`);
        return;
      }

      setTimeout(() => {
        setCurrentStep(3);
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 800);
      }, 1500);
    },
    [email, role, verifying, supabase, router, resetOtp],
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;

    const next = [...otp];
    let idx = focusIdx;

    for (const char of raw) {
      if (idx >= OTP_LENGTH) break;
      next[idx] = char;
      idx++;
    }

    setOtp(next);
    setFocusIdx(Math.min(idx, OTP_LENGTH - 1));
    setError("");
    e.target.value = "";

    if (idx >= OTP_LENGTH && next.every((d) => d !== "")) {
      verifyCode(next.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...otp];

      if (otp[focusIdx]) {
        next[focusIdx] = "";
      } else if (focusIdx > 0) {
        next[focusIdx - 1] = "";
        setFocusIdx(focusIdx - 1);
      }

      setOtp(next);
      setError("");
    }

    if (e.key === "ArrowLeft" && focusIdx > 0) setFocusIdx(focusIdx - 1);
    if (e.key === "ArrowRight" && focusIdx < OTP_LENGTH - 1) setFocusIdx(focusIdx + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];

    setOtp(next);
    setFocusIdx(Math.min(pasted.length, OTP_LENGTH - 1));
    setError("");

    if (pasted.length === OTP_LENGTH) verifyCode(pasted);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendCooldown(60);
    setError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setFocusIdx(0);
    setCurrentStep(0);

    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: role === "admin" },
    });

    if (resendError) {
      setError("Failed to resend code. Please try again.");
      setResendCooldown(0);
      setCurrentStep(1);
    }
  };

  const progress = Math.min((currentStep / (steps.length - 1)) * 100, 100);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-10 px-6 w-full max-w-md mx-auto text-center h-screen">
      <style jsx global>{`
        @keyframes otpPop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes otpBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes otpShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .otp-pop { animation: otpPop 0.25s ease-out; }
        .otp-blink { animation: otpBlink 1s ease-in-out infinite; }
        .otp-shake { animation: otpShake 0.5s ease-out; }
      `}</style>

      {/* Animated logo */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute inline-flex h-20 w-20 rounded-full opacity-20 animate-ping"
          style={{ background: "var(--primary)", animationDuration: "1.8s" }}
        />
        <span
          className="absolute inline-flex h-16 w-16 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, var(--primary), transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <div
          className="relative z-10 shadow-lg flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            boxShadow: "0 0 32px rgba(245,158,11,0.35)",
          }}
        >
          <span
            className="font-bold tracking-tighter text-white dark:text-slate-950"
            style={{ fontSize: "1.75rem" }}
          >
            B
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 animate-fade-in-up">
        <h1
          className="font-display text-2xl font-black tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {done ? "You're in." : "Check your email"}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9375rem" }}>
          {done
            ? "Redirecting to your dashboard"
            : `We sent an ${OTP_LENGTH}-digit code to your inbox. Type or paste it below.`}
        </p>
      </div>

      {/* OTP Input — step 1 only */}
      {currentStep === 1 && !done && (
        <div className="w-full space-y-4">
          <div
            key={shakeKey}
            className={`flex justify-center gap-1.5 sm:gap-2 cursor-text ${shakeKey > 0 ? "otp-shake" : ""}`}
            onClick={() => inputRef.current?.focus()}
          >
            {otp.map((digit, i) => {
              const isFocused = i === focusIdx && !verifying;
              const isFilled = !!digit;
              const isError = !!error;

              return (
                <div
                  key={i}
                  className="relative w-10 h-12 sm:w-11 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold tracking-tight transition-all duration-300 ease-out border-2"
                  style={{
                    color: "var(--text)",
                    borderColor: isError
                      ? "rgba(239,68,68,0.7)"
                      : isFocused
                        ? "var(--primary)"
                        : "var(--border)",
                    background: isError
                      ? "rgba(239,68,68,0.05)"
                      : isFocused
                        ? "rgba(245,158,11,0.05)"
                        : isFilled
                          ? "rgba(255,255,255,0.02)"
                          : "transparent",
                    boxShadow:
                      isFocused && !isError
                        ? "0 0 20px rgba(245,158,11,0.15)"
                        : "none",
                    transform: isFocused ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {digit ? (
                    <span className="otp-pop">{digit}</span>
                  ) : isFocused ? (
                    <span
                      className="w-[2px] h-5 rounded-full otp-blink"
                      style={{ background: "var(--primary)" }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Hidden native input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="absolute opacity-0 w-0 h-0"
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={verifying}
            aria-label={`Enter ${OTP_LENGTH}-digit verification code`}
          />

          {/* Paste instructions */}
          <div
            className="flex items-start gap-3 rounded-xl text-left mx-auto w-full"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.15)",
              padding: "14px 16px",
            }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: "1.4" }}>💡</span>
            <div className="space-y-1.5">
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--primary)" }}
              >
                Quick Paste
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                Copied the code? Tap the first box above, then:
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Mac: ⌘ + V
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Windows: Ctrl + V
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm font-medium" style={{ color: "rgba(239,68,68,0.9)" }}>
              {error}
            </p>
          )}

          {/* Resend */}
          <div>
            {resendCooldown > 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Resend code in{" "}
                <span className="font-mono font-semibold" style={{ color: "var(--text)" }}>
                  {resendCooldown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={verifying}
                className="text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4"
                style={{ color: "var(--primary)" }}
              >
                Didn't receive a code? Resend
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full space-y-3">
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--primary), var(--primary-hover))",
              boxShadow: "0 0 12px rgba(245,158,11,0.4)",
            }}
          />
        </div>

        {/* Step labels */}
        <div className="space-y-1.5 text-left">
          {steps.map((step, i) => {
            const state = i < currentStep ? "done" : i === currentStep ? "active" : "pending";

            return (
              <div
                key={step.id}
                className="flex items-center gap-2.5 transition-all duration-500"
                style={{
                  opacity: state === "pending" ? 0.3 : 1,
                  transform: state === "active" ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <div
                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300"
                  style={{
                    background:
                      state === "done"
                        ? "var(--primary)"
                        : state === "active"
                          ? "rgba(245,158,11,0.15)"
                          : "var(--border)",
                    border: state === "active" ? "1.5px solid var(--primary)" : "none",
                  }}
                >
                  {state === "done" && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="#0A0A0A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {state === "active" && (
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                </div>

                <span
                  className="text-sm font-medium transition-colors duration-300"
                  style={{
                    color:
                      state === "done"
                        ? "var(--muted)"
                        : state === "active"
                          ? "var(--text)"
                          : "var(--muted)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
