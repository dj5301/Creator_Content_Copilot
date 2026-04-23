"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";

type LaunchState = "starting" | "ready" | "error";

export default function FreeTrialPage() {
  const [state, setState] = useState<LaunchState>("starting");
  const [message, setMessage] = useState(
    "Starting the Streamlit workspace for your free trial...",
  );

  useEffect(() => {
    let cancelled = false;

    const launchTrial = async () => {
      try {
        const response = await fetch("/api/start-free-trial", {
          method: "POST",
        });
        const data = (await response.json()) as {
          launchUrl?: string;
          message?: string;
          error?: string;
        };

        if (!response.ok && response.status !== 202) {
          throw new Error(data.error ?? "Unable to start the free trial.");
        }

        if (cancelled) {
          return;
        }

        setState("ready");
        setMessage(
          data.message ?? "Free trial is ready. Redirecting to Streamlit now...",
        );

        window.location.replace(data.launchUrl ?? "http://localhost:8501");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to start the free trial.",
        );
      }
    };

    void launchTrial();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fafc_46%,#f1f5f9_100%)] px-6 text-slate-950">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Launching Free Trial
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
          Opening the Streamlit workspace
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-600">{message}</p>

        <div className="mt-8 rounded-[1.5rem] bg-slate-950 p-5 text-white">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Why the blank page happened before
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            The browser was opening a brand-new tab first, then waiting for the
            backend to start `app.py` and redirect to Streamlit. During that
            gap, the new tab had no content yet, so it looked blank.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Landing Page
          </a>
          {state === "error" && (
            <a
              href="/free-trial"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Try Again
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
