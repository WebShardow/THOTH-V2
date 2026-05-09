import { prisma } from '@/lib/prisma';
import { computeNextDailyRun, slugify, stripHtml } from './helpers';
import { generateDailyContent, getGoogleAiStudioApiKey } from './google-ai';

function uniqueSlug(base: string, suffix = 0) {
  return suffix === 0 ? base : `${base}-${suffix}`;
}

async function resolveUniqueSlug(base: string) {
  const safeBase = slugify(base) || `post-${Date.now()}`;
  let suffix = 0;
  while (true) {
    const candidate = uniqueSlug(safeBase, suffix);
    const exists = await prisma.page.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!exists) return candidate;
    suffix += 1;
  }
}

export async function getAutomationConfig() {
  const secret = await prisma.secretStore.findUnique({ where: { key: 'google-ai-studio.api-key' } });
  return {
    provider: 'google-ai-studio',
    apiKeyConfigured: Boolean(secret),
  };
}

export async function saveAutomationConfig(apiKey: string) {
  const { encryptSecret } = await import('@/lib/security/secrets');
  await prisma.secretStore.upsert({
    where: { key: 'google-ai-studio.api-key' },
    update: {
      value: encryptSecret(apiKey),
      provider: 'google-ai-studio',
    },
    create: {
      key: 'google-ai-studio.api-key',
      value: encryptSecret(apiKey),
      provider: 'google-ai-studio',
    },
  });

  return getAutomationConfig();
}

export async function listCampaigns() {
  return prisma.aiAutoPostCampaign.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      runs: {
        orderBy: { ranAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function createCampaign(input: {
  name: string;
  topic: string;
  systemPrompt?: string;
  slugPrefix: string;
  model?: string;
  timezone?: string;
  scheduleType?: string;
  scheduleTime?: string;
  publishAsPublished?: boolean;
  isEnabled?: boolean;
}) {
  const scheduleTime = input.scheduleTime || '09:00';
  const timezone = input.timezone || 'Asia/Bangkok';
  const isEnabled = Boolean(input.isEnabled);

  return prisma.aiAutoPostCampaign.create({
    data: {
      name: input.name,
      provider: 'google-ai-studio',
      model: input.model || 'gemini-2.5-flash',
      topic: input.topic,
      systemPrompt: input.systemPrompt || '',
      slugPrefix: slugify(input.slugPrefix) || 'daily-post',
      timezone,
      scheduleType: input.scheduleType || 'daily',
      scheduleTime,
      publishAsPublished: Boolean(input.publishAsPublished),
      isEnabled,
      nextRunAt: isEnabled ? computeNextDailyRun(scheduleTime, timezone) : null,
    },
  });
}

export async function updateCampaign(id: string, input: {
  name: string;
  topic: string;
  systemPrompt?: string;
  slugPrefix: string;
  model?: string;
  timezone?: string;
  scheduleType?: string;
  scheduleTime?: string;
  publishAsPublished?: boolean;
  isEnabled?: boolean;
}) {
  const scheduleTime = input.scheduleTime || '09:00';
  const timezone = input.timezone || 'Asia/Bangkok';
  const isEnabled = Boolean(input.isEnabled);

  return prisma.aiAutoPostCampaign.update({
    where: { id },
    data: {
      name: input.name,
      topic: input.topic,
      systemPrompt: input.systemPrompt || '',
      slugPrefix: slugify(input.slugPrefix) || 'daily-post',
      model: input.model || 'gemini-2.5-flash',
      timezone,
      scheduleType: input.scheduleType || 'daily',
      scheduleTime,
      publishAsPublished: Boolean(input.publishAsPublished),
      isEnabled,
      nextRunAt: isEnabled ? computeNextDailyRun(scheduleTime, timezone) : null,
    },
  });
}

export async function deleteCampaign(id: string) {
  await prisma.aiAutoPostCampaign.delete({ where: { id } });
  return { success: true };
}

export async function runCampaign(id: string) {
  const campaign = await prisma.aiAutoPostCampaign.findUnique({ where: { id } });
  if (!campaign) {
    throw new Error('Campaign not found.');
  }

  const apiKey = await getGoogleAiStudioApiKey();
  const generation = await generateDailyContent({
    apiKey,
    model: campaign.model,
    topic: campaign.topic,
    systemPrompt: campaign.systemPrompt,
  });

  const slug = await resolveUniqueSlug(`${campaign.slugPrefix}-${generation.slugHint}`);
  const excerpt = generation.excerpt || stripHtml(generation.contentHtml).slice(0, 180);

  const page = await prisma.page.create({
    data: {
      title: generation.title,
      slug,
      content: generation.contentHtml,
      excerpt,
      isPublished: campaign.publishAsPublished,
      sourceType: 'ai-auto-post',
      sourceRef: campaign.id,
    },
  });

  const run = await prisma.aiAutoPostRun.create({
    data: {
      campaignId: campaign.id,
      title: generation.title,
      slug,
      status: 'success',
      prompt: campaign.topic,
      output: generation.contentHtml,
    },
  });

  await prisma.aiAutoPostCampaign.update({
    where: { id: campaign.id },
    data: {
      lastRunAt: run.ranAt,
      nextRunAt: campaign.isEnabled ? computeNextDailyRun(campaign.scheduleTime, campaign.timezone, new Date(run.ranAt.getTime() + 1000)) : null,
      lastResult: `Created page /${slug}`,
    },
  });

  return { page, run };
}

export async function runDueCampaigns() {
  const now = new Date();
  const campaigns = await prisma.aiAutoPostCampaign.findMany({
    where: {
      isEnabled: true,
      nextRunAt: { lte: now },
    },
    orderBy: { nextRunAt: 'asc' },
  });

  const results = [] as Array<{ id: string; ok: boolean; message: string }>;

  for (const campaign of campaigns) {
    try {
      await runCampaign(campaign.id);
      results.push({ id: campaign.id, ok: true, message: 'Created page successfully.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Automation run failed';
      await prisma.aiAutoPostRun.create({
        data: {
          campaignId: campaign.id,
          status: 'failed',
          prompt: campaign.topic,
          output: '',
          error: message,
        },
      });
      await prisma.aiAutoPostCampaign.update({
        where: { id: campaign.id },
        data: {
          lastResult: message,
          nextRunAt: computeNextDailyRun(campaign.scheduleTime, campaign.timezone),
        },
      });
      results.push({ id: campaign.id, ok: false, message });
    }
  }

  return results;
}
