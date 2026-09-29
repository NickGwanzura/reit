import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const dummyHash = bcrypt.hash("invalid-crm-login", 12);
const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

function loginThrottleKey(request: Request) {
  const address =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "address-unavailable";
  return createHash("sha256").update(address).digest("hex");
}

async function isLoginBlocked(key: string) {
  const record = await prisma.loginThrottle.findUnique({ where: { key } });
  const now = new Date();
  if (record?.blockedUntil && record.blockedUntil > now) return true;
  return Boolean(record && record.windowStart.getTime() + THROTTLE_WINDOW_MS > now.getTime() && record.attempts >= MAX_LOGIN_ATTEMPTS);
}

async function recordLoginFailure(key: string) {
  const now = new Date();
  const existing = await prisma.loginThrottle.findUnique({ where: { key } });
  if (!existing || existing.windowStart.getTime() + THROTTLE_WINDOW_MS <= now.getTime()) {
    await prisma.loginThrottle.upsert({
      where: { key },
      create: { key, attempts: 1, windowStart: now },
      update: { attempts: 1, windowStart: now, blockedUntil: null },
    });
    return;
  }
  const attempts = existing.attempts + 1;
  await prisma.loginThrottle.update({
    where: { key },
    data: {
      attempts,
      blockedUntil: attempts >= MAX_LOGIN_ATTEMPTS ? new Date(now.getTime() + THROTTLE_WINDOW_MS) : null,
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Work email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials.password === "string" ? credentials.password : "";
        if (!email || !password || email.length > 254 || password.length > 72 || Buffer.byteLength(password, "utf8") > 72) return null;

        const key = loginThrottleKey(request);
        try {
          if (await isLoginBlocked(key)) return null;
          const user = await prisma.user.findUnique({ where: { email } });
          const matches = await bcrypt.compare(password, user?.passwordHash ?? (await dummyHash));
          if (!user || !user.isActive || !matches) {
            await recordLoginFailure(key);
            return null;
          }
          await prisma.loginThrottle.deleteMany({ where: { key } });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            sessionVersion: user.sessionVersion,
          };
        } catch {
          console.error("CRM sign-in could not reach its authentication store.");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub && token.role && typeof token.sessionVersion === "number") {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
});
