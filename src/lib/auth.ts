import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const TOKEN_COOKIE = "hostops_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface OwnerPayload {
  ownerId: number;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: OwnerPayload): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): OwnerPayload | null {
  if (!JWT_SECRET) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as OwnerPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  cookies().set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  cookies().delete(TOKEN_COOKIE);
}

export async function getAuthenticatedOwner(): Promise<OwnerPayload | null> {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function getOwnerFromRequest(request: Request): OwnerPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}
