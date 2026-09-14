'use client';

import { LoaderCircle, LogIn } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await response.json(); setPending(false);
    if (!response.ok) return setError(data.error ?? 'Không thể đăng nhập.');
    router.replace(data.redirectTo); router.refresh();
  }
  return <Card className="shadow-xl shadow-blue-950/10">
    <CardHeader><CardTitle>Đăng nhập</CardTitle><CardDescription>Nhập tài khoản được cấp để tiếp tục.</CardDescription></CardHeader>
    <CardContent><form className="space-y-4" onSubmit={submit}>
      <label className="block space-y-1.5 text-sm font-medium">Tên đăng nhập<Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="Ví dụ: teacher" required /></label>
      <label className="block space-y-1.5 text-sm font-medium">Mật khẩu<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••" required /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button className="w-full" size="lg" type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}Đăng nhập</Button>
    </form></CardContent>
  </Card>;
}
