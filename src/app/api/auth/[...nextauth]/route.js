import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail, getUserByGoogleId, findOrCreateOAuthUser } from '@/lib/db';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await getUserByEmail(credentials.email);

                if (!user) {
                    return null;
                }

                // Simple password check (in production, use hashed passwords)
                if (user.password !== credentials.password) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                    verificationStatus: user.verificationStatus
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log(`[NextAuth] SignIn callback for provider: ${account?.provider}, email: ${profile?.email}`);

            // For Google sign-in, we need to check if user exists
            if (account?.provider === 'google' && profile) {
                try {
                    console.log(`[NextAuth] Checking for existing user with Google ID: ${profile.sub}`);
                    const existingUser = await getUserByGoogleId(profile.sub);

                    if (!existingUser) {
                        // Check by email
                        console.log(`[NextAuth] User not found by Google ID. Checking email: ${profile.email}`);
                        const emailUser = await getUserByEmail(profile.email);

                        if (!emailUser) {
                            console.log(`[NextAuth] User not found. Redirecting to registration.`);
                            // New user - needs to select role
                            // Store profile in session for role selection
                            return `/register?google=true&email=${encodeURIComponent(profile.email)}&name=${encodeURIComponent(profile.name)}&googleId=${profile.sub}&image=${encodeURIComponent(profile.picture || '')}`;
                        }
                    }
                    console.log(`[NextAuth] User found. allowing sign in.`);
                } catch (error) {
                    console.error('[NextAuth] SignIn Database Error:', error);
                    // Return false to deny sign in or a specific error redirect
                    // Using a simple error query param to avoid header overflow
                    return '/login?error=DatabaseError';
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile }) {
            // Initial sign in from provider
            if (account && user) {
                token.accessToken = account.access_token;
                token.id = user.id;
            }

            // Always sync with database to ensure role/status is up to date
            // This fixes issues where Google login doesn't immediately have role in session
            if (token.email) {
                try {
                    const dbUser = await getUserByEmail(token.email);
                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                        token.verificationStatus = dbUser.verificationStatus;
                        // console.log(`[NextAuth] synced role for ${token.email}: ${token.role}`);
                    }
                } catch (error) {
                    console.error('[NextAuth] Error syncing user in JWT:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.verificationStatus = token.verificationStatus;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
