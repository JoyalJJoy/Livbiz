import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { normalizeIndianPhone } from './validation';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === 'production' && !nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET must be configured in production.');
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh token daily
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        const identifier = credentials.email.trim();
        let user = null;

        if (identifier.includes('@')) {
          user = await prisma.user.findUnique({
            where: { email: identifier.toLowerCase() },
            select: { id: true, email: true, name: true, role: true, passwordHash: true },
          });
        } else {
          const cleanPhone = normalizeIndianPhone(identifier);
          user = await prisma.user.findFirst({
            where: { phone: cleanPhone },
            select: { id: true, email: true, name: true, role: true, passwordHash: true },
          });
        }

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials. Please verify your email/mobile number and try again.');
        }

        // Verify password hash
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password.');
        }

        // Return user payload for session callbacks
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: nextAuthSecret,
};
