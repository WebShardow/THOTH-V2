import { decryptSecret } from '@/lib/security/secrets';
import { prisma } from '@/lib/prisma';

type GeneratedContent = {
  title: string;
  excerpt: string;
  contentHtml: string;
  slugHint: string;
};

function cleanJsonPayload(input: string) {
  return input.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

export async function getGoogleAiStudioApiKey() {
  const secret = await prisma.secretStore.findUnique({ where: { key: 'google-ai-studio.api-key' } });
  if (!secret) {
    throw new Error('Google AI Studio API key is not configured yet.');
  }
  return decryptSecret(secret.value);
}

export async function generateDailyContent(options: {
  apiKey: string;
  model: string;
  topic: string;
  systemPrompt?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const prompt = [
    options.systemPrompt?.trim() || 'You are an editorial assistant that writes useful, readable website articles.',
    `Topic focus: ${options.topic}`,
    `Publishing date: ${today}`,
    'Return strict JSON with keys: title, excerpt, contentHtml, slugHint.',
    'contentHtml must be clean HTML using headings, paragraphs, lists, and strong tags when useful.',
    'Avoid markdown fences. Avoid explanations outside the JSON object.',
    'Write a fresh article each time even if the topic stays the same.',
  ].join('\n\n');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent?key=${encodeURIComponent(options.apiKey)}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  const payload = await res.json();

  if (!res.ok) {
    const message = payload?.error?.message || 'AI generation failed';
    throw new Error(message);
  }

  const text = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '';
  if (!text) {
    throw new Error('AI provider returned an empty response.');
  }

  const parsed = JSON.parse(cleanJsonPayload(text)) as Partial<GeneratedContent>;

  if (!parsed.title || !parsed.contentHtml) {
    throw new Error('AI response is missing required fields.');
  }

  return {
    title: parsed.title,
    excerpt: parsed.excerpt || '',
    contentHtml: parsed.contentHtml,
    slugHint: parsed.slugHint || parsed.title,
  };
}
