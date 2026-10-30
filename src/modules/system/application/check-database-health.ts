import { DATABASE_TABLES, DatabaseHealthPort, DatabaseTableName, HealthCheckResult } from "../ports/database-halth.port";


export interface TableHealthResult {
    name: DatabaseTableName;
    label: string;
    result: HealthCheckResult;
}

export interface DatabaseHealthReport {
    connection: HealthCheckResult;
    tables: TableHealthResult[];
    ok: boolean;
}

export async function checkDatabaseHealth(
    database: DatabaseHealthPort,
): Promise<DatabaseHealthReport> {
    const [connection, ...tableResults] = await Promise.all([
        database.checkConnection(),

        ...DATABASE_TABLES.map((table) =>
            database.checkTable(table.name),
        ),
    ]);

    const tables = DATABASE_TABLES.map((table, index) => ({
        name: table.name,
        label: table.label,
        result: tableResults[index],
    }));

    return {
        connection,
        tables,
        ok:
            connection.ok &&
            tables.every((table) => table.result.ok),
    };
}
