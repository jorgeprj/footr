import "server-only";

import type {
    ServiceHealth,
    SystemStatusGateway,
} from "../../ports/system-status-gateway";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function checkEndpoint(url: string): Promise<ServiceHealth> {
    const startTime = performance.now();

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                apikey: SUPABASE_KEY!,
            },
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        const responseTime = Math.round(performance.now() - startTime);

        if (response.ok) {
            return { status: "operational", responseTime };
        }

        if (response.status === 401 || response.status === 403) {
            return { status: "restricted", responseTime };
        }

        return { status: "unavailable", responseTime };
    } catch {
        return {
            status: "unavailable",
            responseTime: null,
        };
    }
}

export function createSupabaseSystemStatusGateway(): SystemStatusGateway {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        const unavailable: ServiceHealth = {
            status: "unavailable",
            responseTime: null,
        };

        return {
            checkDatabase: async () => unavailable,
            checkAuthentication: async () => unavailable,
        };
    }

    const baseUrl = SUPABASE_URL.replace(/\/$/, "");

    return {
        checkDatabase: () =>
            checkEndpoint(`${baseUrl}/rest/v1/stores?select=id&limit=1`),

        checkAuthentication: () =>
            checkEndpoint(`${baseUrl}/auth/v1/health`),
    };
}
