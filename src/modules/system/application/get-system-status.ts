import type {
    SystemHealth,
    SystemStatusGateway,
} from "../ports/system-status-gateway";

export async function getSystemStatus(gateway: SystemStatusGateway): Promise<SystemHealth> {
    const [database, authentication] = await Promise.all([
        gateway.checkDatabase(),
        gateway.checkAuthentication(),
    ]);

    return {
        database,
        authentication,
        checkedAt: new Date().toISOString(),
    };
}