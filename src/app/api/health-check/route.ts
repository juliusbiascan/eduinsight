import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Check database connection with timeout
    const dbStatus = await Promise.race([
      db.$queryRaw`SELECT 1+1 as result`
        .then(() => true)
        .catch((error) => {
          console.error('Database health check failed:', error);
          return false;
        }),
      new Promise((resolve) => setTimeout(() => {
        console.error('Database health check timeout');
        resolve(false);
      }, 5000))  // 5 second timeout
    ]);

    // Check API health (self-check)
    const apiStatus = true;

    // Check storage (you might want to implement your own storage check)
    const storageStatus = true;

    // Determine overall system status
    let status: 'operational' | 'warning' | 'error' = 'operational';
    
    if (!dbStatus) {
      status = 'error';
    } else if (!storageStatus) {
      status = 'warning';
    }

    return NextResponse.json({
      status,
      services: {
        api: apiStatus,
        database: dbStatus,
        storage: storageStatus,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        services: {
          api: false,
          database: false,
          storage: false,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
