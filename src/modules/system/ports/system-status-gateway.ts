export type ServiceStatus =
    | "operational"
    | "restricted"
    | "unavailable";

export interface ServiceHealth {
    status: ServiceStatus;
    responseTime: number | null;
}

export interface SystemHealth {
    database: ServiceHealth;
    authentication: ServiceHealth;
    checkedAt: string;
}

export interface SystemStatusGateway {
    checkDatabase(): Promise<ServiceHealth>;
    checkAuthentication(): Promise<ServiceHealth>;
}