import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './db';
import User from './models/User';

declare module 'next-auth' {
  interface User {
    role?: string;
    scopeType?: string;
    scopeId?: string;
    parishId?: string;
    naturalGroupId?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      scopeType?: string;
      scopeId?: string;
      parishId?: string;
      naturalGroupId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    scopeType?: string;
    scopeId?: string;
    parishId?: string;
    naturalGroupId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email, isActive: true });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          scopeType: user.scopeType,
          scopeId: user.scopeId?.toString() || '',
          parishId: user.parishId?.toString() || '',
          naturalGroupId: user.naturalGroupId?.toString() || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.scopeType = user.scopeType;
        token.scopeId = user.scopeId;
        token.parishId = user.parishId;
        token.naturalGroupId = user.naturalGroupId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.scopeType = token.scopeType;
        session.user.scopeId = token.scopeId;
        session.user.parishId = token.parishId;
        session.user.naturalGroupId = token.naturalGroupId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
