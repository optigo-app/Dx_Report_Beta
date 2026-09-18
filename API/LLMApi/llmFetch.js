// Shared fetch helper for Optigo AI/LLM endpoints — POST JSON, timeout,
// and external abort-signal combining live here so each API file only
// declares its endpoint and body shape.

export const LLM_API_BASE =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://optigollm.web";

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * POST a JSON body to an endpoint and return the parsed response.
 * @param {string} path - Absolute URL, or a path appended to LLM_API_BASE.
 * @param {Object} body - Request body (JSON-serialized).
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal] - External abort signal (e.g. Stop button).
 * @param {number} [opts.timeoutMs] - Timeout in ms (default 30s). Pass 0 to disable.
 */
export const postJson = async (
  path,
  body,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) => {
  const url = /^https?:\/\//i.test(path) ? path : `${LLM_API_BASE}${path}`;

  const timeoutCtrl = new AbortController();
  const timeoutId =
    timeoutMs > 0 ? setTimeout(() => timeoutCtrl.abort(), timeoutMs) : null;

  // Combine the caller's abort signal with the timeout controller.
  let combinedSignal = timeoutCtrl.signal;
  if (signal) {
    if (signal.aborted) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutCtrl.abort();
    } else {
      signal.addEventListener("abort", () => timeoutCtrl.abort(), { once: true });
      combinedSignal = signal;
    }
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: combinedSignal,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export default postJson;
