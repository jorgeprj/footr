import { createClient } from "@/shared/lib/supabase/server";
import { DatabaseHealthPort, DatabaseTableName, HealthCheckResult } from "../../ports/database-halth.port";



export class SupabaseDatabaseHealthAdapter
    implements DatabaseHealthPort {
    async checkConnection(): Promise<HealthCheckResult> {
        return this.checkTable("stores");
    }

    async checkTable(
        table: DatabaseTableName,
    ): Promise<HealthCheckResult> {
        try {
            const supabase = createClient();

            const { error } = await supabase
                .from(table)
                .select("id")
                .limit(1);

            if (error) {
                console.error(
                    `[Supabase health check] Table: ${table}`,
                    error.message,
                );

                return {
                    ok: false,
                    message: "A consulta falhou.",
                };
            }

            return {
                ok: true,
                message: "Consulta realizada com sucesso.",
            };
        } catch (error) {
            console.error(
                `[Supabase health check] Table: ${table}`,
                error,
            );

            return {
                ok: false,
                message: "Não foi possível executar a consulta.",
            };
        }
    }
}
