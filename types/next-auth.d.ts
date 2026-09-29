import type { UserRole } from "@/app/generated/prisma/client";
import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      sessionVersion: number;
    } & NonNullable<DefaultSession["user"]>;
  }

  interface User {
    role: UserRole;
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    sessionVersion?: number;
  }
}
