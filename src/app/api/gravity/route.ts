import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/pihole';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {

        const sessionAuth = await auth();

        if (!sessionAuth) {
            return new NextResponse("Unauthorized", { status: 403 });
        }
        
        const session = await getSession();

        if (!session.valid) {
            return new Response('Invalid session', { status: 401 });
        }

        const response = await fetch(`https://pi.eduinsight.systems/api/action/gravity?sid=${session.sid}`, {
            method: 'POST',
            headers: {
                'X-CSRF-Token': session.csrf || '',
            },
        });

        // Create a TransformStream to pipe the response
        const transformStream = new TransformStream();
        response.body?.pipeTo(transformStream.writable);

        return new Response(transformStream.readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        return new Response(error instanceof Error ? error.message : 'Internal server error', {
            status: 500
        });
    }
}
