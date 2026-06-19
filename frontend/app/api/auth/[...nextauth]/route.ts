import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text', placeholder: '9876543210' },
        otp: { label: 'OTP', type: 'password', placeholder: '123456' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/auth/login`;

        try {
          const res = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: credentials.phone,
              otp: credentials.otp
            })
          });

          const data = await res.json();
          if (res.ok && data.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              phone: data.user.phone,
              location: data.user.location,
              language: data.user.language,
              token: data.token
            };
          }
        } catch (err) {
          console.warn('Authentication backend connection failed. Trying mock authentication.');
        }

        // Fallback demo credentials check
        // OTP: 123456
        if (credentials.otp === '123456') {
          const mockUsers: Record<string, any> = {
            '9876543210': { id: 'farmer-1', name: 'Anbu Selvan', role: 'FARMER', location: 'Madurai', language: 'ta' },
            '9000000001': { id: 'fpo-1', name: 'Madurai Farmers Collective', role: 'FPO', location: 'Madurai', language: 'ta' },
            '8000000001': { id: 'buyer-1', name: 'Rel-Agro Foods Ltd', role: 'BUYER', location: 'Chennai', language: 'en' },
            '7000000001': { id: 'gov-1', name: 'State Agriculture Director', role: 'GOVERNMENT', location: 'Chennai', language: 'en' }
          };

          const mock = mockUsers[credentials.phone];
          if (mock) {
            return {
              id: mock.id,
              name: mock.name,
              email: `${mock.role.toLowerCase()}@smartag.org`,
              role: mock.role,
              phone: credentials.phone,
              location: mock.location,
              language: mock.language,
              token: 'mock-jwt-token'
            };
          }
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.location = (user as any).location;
        token.language = (user as any).language;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          location: token.location as string,
          language: token.language as string,
          accessToken: token.accessToken as string
        } as any;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'smartag_jwt_signing_secret_key_change_in_production'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
