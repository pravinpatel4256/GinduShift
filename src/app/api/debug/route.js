import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
    const session = await getServerSession(authOptions);

    return Response.json({
        timestamp: new Date().toISOString(),
        environment: {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
            NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
            VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
            hasSecret: !!process.env.NEXTAUTH_SECRET,
            hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
            hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        },
        session: session ? {
            exists: true,
            user: {
                email: session.user?.email,
                name: session.user?.name,
                role: session.user?.role,
                id: session.user?.id,
            }
        } : {
            exists: false,
            user: null
        },
        headers: {
            host: request.headers.get('host'),
            origin: request.headers.get('origin'),
            referer: request.headers.get('referer'),
        }
    });
}
