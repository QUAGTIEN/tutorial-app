import { NextResponse } from 'next/server';

import { authenticate, createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;
  if (!body?.username || !body.password) return NextResponse.json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' }, { status: 400 });
  const user = await authenticate(body.username, body.password);
  if (!user) return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, { status: 401 });
  const session = await createSession(user.id);
  const response = NextResponse.json({ role: user.role, redirectTo: user.role === 'TEACHER' ? '/teacher' : '/student' });
  response.cookies.set(SESSION_COOKIE, session.id, sessionCookieOptions(session.expiresAt));
  return response;
}
