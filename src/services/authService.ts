/**
 * UI-ONLY mock auth. Simulates async calls so the screens can show real
 * loading / success / error states without any backend. Replace these bodies
 * with real API calls later — the shapes are intentionally close to a typical
 * auth API so wiring is a drop-in.
 *
 * Nothing here is secure or persistent: no real OTP is sent, no password is
 * checked against a server. `requestOtp` returns the generated code so the UI
 * can surface it as a "demo code" for testing the flow.
 */
export type AuthMethod = 'email' | 'phone';

export interface MockAuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function deriveName(identifier: string): string {
  const handle = identifier.includes('@') ? identifier.split('@')[0] : identifier;
  const cleaned = handle.replace(/[^a-zA-Z]/g, ' ').trim();
  if (!cleaned) return 'Member';
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function makeUser(method: AuthMethod, identifier: string, name?: string): MockAuthUser {
  return {
    id: `u_${Math.random().toString(36).slice(2, 10)}`,
    name: name?.trim() || deriveName(identifier),
    email: method === 'email' ? identifier : undefined,
    phone: method === 'phone' ? identifier : undefined,
  };
}

function genOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const authService = {
  async login(method: AuthMethod, identifier: string, _password: string): Promise<MockAuthUser> {
    await wait(900);
    return makeUser(method, identifier);
  },

  async register(
    method: AuthMethod,
    identifier: string,
    name: string,
    _password: string
  ): Promise<MockAuthUser> {
    await wait(1000);
    return makeUser(method, identifier, name);
  },

  /** Returns the generated code so the UI can show it as a demo hint. */
  async requestOtp(_method: AuthMethod, _identifier: string): Promise<string> {
    await wait(800);
    return genOtp();
  },

  async verifyOtp(code: string, expected: string): Promise<boolean> {
    await wait(600);
    return code === expected;
  },

  async resetPassword(_identifier: string, _newPassword: string): Promise<void> {
    await wait(800);
  },

  async changePassword(_current: string, _next: string): Promise<void> {
    await wait(800);
  },
};
