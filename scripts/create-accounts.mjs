/**
 * Creates a Developer (CLIENT role) and Admin (ADMIN role) account in both
 * Supabase Auth and the Prisma User table.
 *
 * Usage:
 *   node scripts/create-accounts.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

const accounts = [
  {
    email: 'developer@livbizz.com',
    password: 'Developer@123',
    name: 'Developer',
    firstName: 'Dev',
    lastName: 'User',
    role: 'CLIENT', // Developer gets CLIENT role
  },
  {
    email: 'admin@livbizz.com',
    password: 'Admin@123',
    name: 'Admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
];

async function createAccount(account) {
  console.log(`\n📧 Creating account: ${account.email} (role: ${account.role})`);

  // 1. Check if user already exists in Supabase Auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingAuth = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === account.email.toLowerCase()
  );

  let supabaseUserId;

  if (existingAuth) {
    supabaseUserId = existingAuth.id;
    console.log(`  ⚡ Already exists in Supabase Auth (ID: ${supabaseUserId})`);

    // Update password to the desired one
    const { error: updateError } = await supabase.auth.admin.updateUserById(supabaseUserId, {
      password: account.password,
    });
    if (updateError) {
      console.error(`  ❌ Failed to update password: ${updateError.message}`);
    } else {
      console.log(`  ✅ Password updated`);
    }
  } else {
    // Create in Supabase Auth
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name },
    });

    if (createError || !authData.user) {
      console.error(`  ❌ Failed to create Supabase Auth user: ${createError?.message ?? 'unknown'}`);
      return;
    }

    supabaseUserId = authData.user.id;
    console.log(`  ✅ Created in Supabase Auth (ID: ${supabaseUserId})`);
  }

  // 2. Create or update in Prisma User table
  const existingProfile = await prisma.user.findUnique({
    where: { email: account.email.toLowerCase() },
  });

  if (existingProfile) {
    // Update existing profile to match Supabase Auth ID and role
    if (existingProfile.id !== supabaseUserId) {
      await prisma.user.update({
        where: { email: account.email.toLowerCase() },
        data: { id: supabaseUserId, role: account.role },
      });
      console.log(`  ✅ Updated Prisma profile (ID: ${existingProfile.id} → ${supabaseUserId})`);
    } else {
      await prisma.user.update({
        where: { id: supabaseUserId },
        data: { role: account.role },
      });
      console.log(`  ✅ Prisma profile already exists, role updated to ${account.role}`);
    }
  } else {
    await prisma.user.create({
      data: {
        id: supabaseUserId,
        email: account.email.toLowerCase(),
        name: account.name,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
      },
    });
    console.log(`  ✅ Created Prisma profile (role: ${account.role})`);
  }

  console.log(`  🎉 Done: ${account.email} / ${account.password}`);
}

async function main() {
  console.log('🚀 Creating Developer & Admin accounts...\n');

  for (const account of accounts) {
    await createAccount(account);
  }

  console.log('\n✅ All accounts created successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('┌─────────────────────────────────┬────────────────┬─────────┐');
  console.log('│ Email                           │ Password       │ Role    │');
  console.log('├─────────────────────────────────┼────────────────┼─────────┤');
  console.log('│ developer@livbizz.com           │ Developer@123  │ CLIENT  │');
  console.log('│ admin@livbizz.com               │ Admin@123      │ ADMIN   │');
  console.log('└─────────────────────────────────┴────────────────┴─────────┘');
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
