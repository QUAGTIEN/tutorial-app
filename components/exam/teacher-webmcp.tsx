'use client';

import { useEffect } from 'react';

type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; execute: (input: unknown) => Promise<unknown>; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean } }, options: { signal: AbortSignal }) => void | Promise<void> };

export function TeacherWebMcp() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'create_exam',
      title: 'Tạo đề kiểm tra',
      description: 'Tạo một đề trắc nghiệm mới trong tài khoản giáo viên hiện tại, sau đó mở trang chỉnh sửa đề.',
      inputSchema: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string', description: 'Tên đề kiểm tra.' },
          description: { type: 'string', description: 'Hướng dẫn ngắn cho học sinh.' },
          questions: { type: 'array', minItems: 1, items: { type: 'object', additionalProperties: false, required: ['content', 'points', 'choices'], properties: { content: { type: 'string' }, points: { type: 'integer', minimum: 1, maximum: 10 }, choices: { type: 'array', minItems: 2, items: { type: 'object', additionalProperties: false, required: ['content', 'isCorrect'], properties: { content: { type: 'string' }, isCorrect: { type: 'boolean' } } } } } } },
        }, required: ['title', 'questions'],
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      async execute(input: unknown) {
        const response = await fetch('/api/exams', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Không thể tạo đề.');
        window.location.assign(`/teacher/exams/${data.id}`);
        return { id: data.id, status: 'created' };
      },
    };
    try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined); } catch { /* Browser does not support WebMCP. */ }
    return () => lifecycle.abort();
  }, []);
  return null;
}
