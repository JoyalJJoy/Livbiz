 import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

type AuthUserSummary = {
  id: string;
  email?: string;
};

async function listAllAuthUsers() {
  const users: AuthUserSummary[] = [];
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`Failed to list Supabase Auth users: ${error.message}`);
    }

    users.push(...data.users.map((user) => ({ id: user.id, email: user.email ?? undefined })));

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function getDataCounts() {
  const [users, bookings, tickets, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.ticket.count(),
    prisma.auditLog.count(),
  ]);

  return { users, bookings, tickets, auditLogs };
}

async function updatePublicUserId(oldUserId: string, supabaseUserId: string) {
  if (oldUserId === supabaseUserId) {
    return;
  }

  const existingProfile = await prisma.user.findUnique({
    where: { id: supabaseUserId },
    select: { email: true },
  });

  if (existingProfile) {
    throw new Error(
      `Cannot move ${oldUserId} to ${supabaseUserId}; that target profile already exists for ${existingProfile.email}.`,
    );
  }

  await prisma.user.update({
    where: { id: oldUserId },
    data: { id: supabaseUserId },
  });
}

async function main() {
  const beforeCounts = await getDataCounts();
  console.log('Current public data counts:', beforeCounts);

  const authUsers = await listAllAuthUsers();
  const authUserByEmail = new Map(
    authUsers
      .filter((user): user is Required<AuthUserSummary> => Boolean(user.email))
      .map((user) => [user.email.toLowerCase(), user]),
  );

  // Fetch all users from Prisma
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${users.length} user(s) in Prisma database.\n`);

  for (const user of users) {
    console.log(`Processing: ${user.email} (${user.role})`);
    const normalizedEmail = user.email.toLowerCase();
    let supabaseUserId: string | null = null;

    // Check if user already exists in Supabase Auth
    const existingAuthUser = authUserByEmail.get(normalizedEmail);

    if (existingAuthUser) {
      supabaseUserId = existingAuthUser.id;
      console.log(`  Already exists in Supabase Auth (ID: ${supabaseUserId})`);
    } else {
      // Create user in Supabase Auth with a random temp password
      const tempPassword = `Migrate_${crypto.randomUUID().slice(0, 16)}!`;

      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: user.name },
      });

      if (createError || !authData.user) {
        console.error(`  Failed to create Supabase Auth user: ${createError?.message ?? 'unknown error'}\n`);
        continue;
      }

      supabaseUserId = authData.user.id;
      authUserByEmail.set(normalizedEmail, { id: supabaseUserId, email: user.email });
      console.log(`  Created in Supabase Auth (ID: ${supabaseUserId})`);
    }

    // Update the Prisma User row to use the new Supabase Auth UUID
    if (user.id !== supabaseUserId) {
      try {
        await updatePublicUserId(user.id, supabaseUserId);
        console.log(`  Updated public user ID: ${user.id} -> ${supabaseUserId}`);
      } catch (txError) {
        console.error(`  Failed to update public user ID. Related data was not changed: ${txError}\n`);
        continue;
      }
    }

    // Generate password reset link
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: user.email,
    });

    if (resetError || !resetData?.properties?.action_link) {
      console.log(`  Could not generate reset link: ${resetError?.message}\n`);
    } else {
      console.log(`  Password reset link: ${resetData.properties.action_link}\n`);
    }
  }

  const afterCounts = await getDataCounts();
  console.log('Final public data counts:', afterCounts);
  console.log('\nMigration complete.');
  console.log('Each user must reset their password using the links above or via "Forgot Password" on the login page.');
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
