import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STREAMLIT_PORT = Number(process.env.STREAMLIT_PORT ?? "8501");
const STREAMLIT_SERVER_ADDRESS =
  process.env.STREAMLIT_SERVER_ADDRESS?.trim() || "127.0.0.1";
const STREAMLIT_PUBLIC_URL =
  process.env.STREAMLIT_PUBLIC_URL?.trim() ||
  `http://localhost:${STREAMLIT_PORT}`;
const STREAMLIT_MANAGED_EXTERNALLY =
  process.env.STREAMLIT_MANAGED_EXTERNALLY === "true";

function isPortOpen(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();

    const finish = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(350);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, "127.0.0.1");
  });
}

async function waitForPort(
  port: number,
  attempts = 24,
  delayMs = 500,
): Promise<boolean> {
  for (let index = 0; index < attempts; index += 1) {
    if (await isPortOpen(port)) {
      return true;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }

  return false;
}

function resolvePythonBinary() {
  if (process.env.PYTHON_BINARY?.trim()) {
    return process.env.PYTHON_BINARY.trim();
  }

  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "venv", "bin", "python"),
    path.join(cwd, ".venv", "bin", "python"),
    "python3",
    "python",
  ];

  return (
    candidates.find((candidate) => {
      if (candidate === "python3" || candidate === "python") {
        return true;
      }

      return fs.existsSync(candidate);
    }) ?? "python3"
  );
}

export async function POST() {
  const cwd = process.cwd();
  const appPath = path.join(cwd, "app.py");

  if (STREAMLIT_MANAGED_EXTERNALLY) {
    return NextResponse.json({
      launchUrl: STREAMLIT_PUBLIC_URL,
      message:
        "Free trial is managed by an external Streamlit service. Opening it now.",
      status: "ready",
    });
  }

  if (!fs.existsSync(appPath)) {
    return NextResponse.json(
      { error: "Could not find app.py in the project root." },
      { status: 404 },
    );
  }

  if (await isPortOpen(STREAMLIT_PORT)) {
    return NextResponse.json({
      launchUrl: STREAMLIT_PUBLIC_URL,
      message: "Free trial is already running. Opening the existing app.",
      status: "ready",
    });
  }

  const pythonBinary = resolvePythonBinary();
  const logsDir = path.join(cwd, ".next", "logs");
  const logPath = path.join(logsDir, "streamlit.log");

  fs.mkdirSync(logsDir, { recursive: true });
  const logFile = fs.openSync(logPath, "a");

  spawn(
    pythonBinary,
    [
      "-m",
      "streamlit",
      "run",
      "app.py",
      "--server.address",
      STREAMLIT_SERVER_ADDRESS,
      "--server.port",
      String(STREAMLIT_PORT),
      "--server.headless",
      "true",
      "--browser.gatherUsageStats",
      "false",
    ],
    {
      cwd,
      detached: true,
      stdio: ["ignore", logFile, logFile],
      env: {
        ...process.env,
        BROWSER: "none",
      },
    },
  ).unref();

  const isReady = await waitForPort(STREAMLIT_PORT);

  if (!isReady) {
    return NextResponse.json(
      {
        launchUrl: STREAMLIT_PUBLIC_URL,
        message:
          "The Streamlit app is starting in the background. If it takes a moment, refresh the new tab once after a few seconds.",
        status: "starting",
      },
      { status: 202 },
    );
  }

  return NextResponse.json({
    launchUrl: STREAMLIT_PUBLIC_URL,
    message: "Free trial started successfully in a new tab.",
    status: "started",
  });
}
