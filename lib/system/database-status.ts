import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type DatabaseBootstrapStatus = {
  hasDatabaseUrl: boolean;
  canConnect: boolean;
  schemaReady: boolean;
  needsSetup: boolean;
  message: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return error.message;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : 'Unknown database error';
}

export async function getDatabaseBootstrapStatus(): Promise<DatabaseBootstrapStatus> {
  if (!process.env.DATABASE_URL) {
    return {
      hasDatabaseUrl: false,
      canConnect: false,
      schemaReady: false,
      needsSetup: false,
      message: 'DATABASE_URL is not configured yet.',
    };
  }

  try {
    await prisma.$queryRawUnsafe('SELECT 1');
  } catch (error) {
    return {
      hasDatabaseUrl: true,
      canConnect: false,
      schemaReady: false,
      needsSetup: false,
      message: `Database connection failed. ${getErrorMessage(error)}`,
    };
  }

  try {
    const count = await prisma.user.count();
    return {
      hasDatabaseUrl: true,
      canConnect: true,
      schemaReady: true,
      needsSetup: count === 0,
      message: count === 0 ? 'Database is ready. Create the first admin account.' : 'Database is ready.',
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return {
        hasDatabaseUrl: true,
        canConnect: true,
        schemaReady: false,
        needsSetup: false,
        message: 'Database is reachable, but the schema is not applied yet. Run `npx prisma db push` or `npx prisma migrate deploy`.',
      };
    }

    return {
      hasDatabaseUrl: true,
      canConnect: true,
      schemaReady: false,
      needsSetup: false,
      message: `Database schema check failed. ${getErrorMessage(error)}`,
    };
  }
}
