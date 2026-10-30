export const DATABASE_TABLES = [
    { name: "stores", label: "Lojas" },
    { name: "store_members", label: "Membros das lojas" },
    { name: "products", label: "Produtos" },
    { name: "sales", label: "Vendas" },
    { name: "sale_items", label: "Itens vendidos" },
] as const;

export type DatabaseTableName =
    (typeof DATABASE_TABLES)[number]["name"];

export interface HealthCheckResult {
    ok: boolean;
    message: string;
}

export interface DatabaseHealthPort {
    checkConnection(): Promise<HealthCheckResult>;

    checkTable(
        table: DatabaseTableName,
    ): Promise<HealthCheckResult>;
}
