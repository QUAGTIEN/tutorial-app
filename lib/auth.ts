import { and, eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getDb } from '@/db';
import { sessions, users } from '@/db/schema';
import type { CurrentUser, Role } from '@/types';

const SESSION_COOKIE = 'kiem_tra_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const demoUsers = [
  { id: 'demo-teacher', username: 'teacher', password: '123456', fullName: 'Giáo viên mẫu', role: 'TEACHER' as const },
  { id: 'demo-student', username: 'student', password: '123456', fullName: 'Học sinh mẫu', role: 'STUDENT' as const },
];

async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function ensureDemoUsers() {
  const db = getDb();
  const now = Date.now();
  for (const user of demoUsers) {
    await db.insert(users).values({
      id: user.id,
      username: user.username,
      passwordHash: await hashPassword(user.password),
      fullName: user.fullName,
      role: user.role,
      createdAt: now,
    }).onConflictDoNothing();
  }
}

export async function authenticate(username: string, password: string): Promise<CurrentUser | null> {
  await ensureDemoUsers();
  const account = await getDb().select().from(users).where(eq(users.username, username.trim())).get();
  if (!account || account.passwordHash !== await hashPassword(password)) return null;
  return { id: account.id, username: account.username, fullName: account.fullName, role: account.role as Role };
}

export async function createSession(userId: string) {
  const id = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  await getDb().insert(sessions).values({ id, userId, createdAt: now, expiresAt });
  return { id, expiresAt };
}

export async function deleteSession(sessionId: string | undefined) {
  if (sessionId) await getDb().delete(sessions).where(eq(sessions.id, sessionId));
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const record = await getDb().select({ id: users.id, username: users.username, fullName: users.fullName, role: users.role })
    .from(sessions).innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Date.now()))).get();
  return record ? { ...record, role: record.role as Role } : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) redirect(user.role === 'TEACHER' ? '/teacher' : '/student');
  return user;
}

export function sessionCookieOptions(expiresAt: number) {
  return { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', expires: new Date(expiresAt) };
}

export { SESSION_COOKIE };
