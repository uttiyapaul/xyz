/**
 * CarbonIQ Platform — jest.setup.ts
 * Global test setup: env vars, global mocks.
 */

// Mock environment variables for all tests
process.env.NEXT_PUBLIC_SUPABASE_URL      = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_PUBLIC_APP_VERSION       = "0.0.0-test";
process.env.NODE_ENV                      = "test";

// Mock crypto.randomUUID for test environments
if (typeof globalThis.crypto === "undefined") {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => "00000000-0000-0000-0000-000000000001",
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
  });
}

// Mock Supabase client (prevents actual network calls)
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser:          jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut:          jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    order:  jest.fn().mockReturnThis(),
    limit:  jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

// Suppress console.error in tests unless explicitly testing errors
const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((...args) => {
    // Allow [SecurityMiddleware] messages in security tests
    if (typeof args[0] === "string" && args[0].includes("[SecurityMiddleware]")) return;
    if (typeof args[0] === "string" && args[0].includes("[AuditMiddleware]"))    return;
    // Suppress React warnings in test output
    if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
  });
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore?.();
});
