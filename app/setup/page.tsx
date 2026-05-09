import { redirect } from 'next/navigation';
import SetupForm from './SetupForm';
import { getDatabaseBootstrapStatus } from '@/lib/system/database-status';

export const metadata = {
  title: 'Initial Setup — Micro Headless CMS',
  description: 'Create the first administrator after the database is ready.',
};

export default async function SetupPage() {
  const status = await getDatabaseBootstrapStatus();

  if (status.schemaReady && !status.needsSetup) {
    redirect('/login');
  }

  return <SetupForm bootstrap={status} />;
}
