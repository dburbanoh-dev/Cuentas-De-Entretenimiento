import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rpcResult = vi.fn<(signal: AbortSignal) => Promise<unknown>>();

vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/lib/supabase/public", () => ({
  getPublicClient: () => ({
    rpc: () => ({ abortSignal: (signal: AbortSignal) => rpcResult(signal) }),
  }),
}));

const { HEALTH_TIMEOUT_MS } = await import("@/lib/health");
const { GET } = await import("./route");

beforeEach(() => {
  rpcResult.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/health", () => {
  it("responde 200 cuando la base de datos contesta", async () => {
    rpcResult.mockResolvedValue({ data: 1, error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: "ok",
      database: "ok",
      timestamp: expect.any(String),
    });
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("responde 503 sin detalles internos cuando la base de datos falla", async () => {
    rpcResult.mockResolvedValue({
      data: null,
      error: { message: "password authentication failed for user postgres" },
    });

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(JSON.parse(text)).toEqual({
      status: "degraded",
      database: "error",
      timestamp: expect.any(String),
    });
    expect(text).not.toContain("password");
  });

  it("responde 503 si el cliente lanza una excepción", async () => {
    rpcResult.mockRejectedValue(new Error("fetch failed: ECONNREFUSED"));

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).not.toContain("ECONNREFUSED");
  });

  it("cancela la petición y responde 503 antes de 5 segundos si la base de datos no contesta", async () => {
    vi.useFakeTimers();
    let receivedSignal: AbortSignal | undefined;
    // Simula fetch: solo termina cuando se aborta.
    rpcResult.mockImplementation(
      (signal) =>
        new Promise((resolve) => {
          receivedSignal = signal;
          signal.addEventListener("abort", () =>
            resolve({ data: null, error: { message: "AbortError" } }),
          );
        }),
    );

    const pending = GET();
    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS);
    const response = await pending;

    expect(HEALTH_TIMEOUT_MS).toBeLessThan(5000);
    expect(receivedSignal?.aborted).toBe(true);
    expect(response.status).toBe(503);
    expect((await response.json()).database).toBe("error");
  });
});
