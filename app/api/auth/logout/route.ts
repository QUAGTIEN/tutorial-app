import { NextResponse } from 'next/server';

import { deleteSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  await deleteSession(request.headers.get('cookie')?.match(/(?:^|; )kiem_tra_session=([^;]+)/)?.[1]);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
