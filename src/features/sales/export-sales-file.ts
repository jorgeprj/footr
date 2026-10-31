
import ExcelJS from "exceljs-community";
import type { SaleDetails } from "@/modules/sales/domain/sale";

export type SalesExportFormat = "json" | "xlsx" | "csv";

const paymentLabels: Record<SaleDetails["paymentMethod"], string> = {
    installment: "Parcelado",
    credit: "Crédito",
    debit: "Débito",
    pix: "Pix",
    cash: "Dinheiro",
};

const statusLabels: Record<SaleDetails["status"], string> = {
    pending: "Pendente",
    completed: "Concluída",
    cancelled: "Cancelada",
    refunded: "Estornada",
};

function getFileName(format: SalesExportFormat): string {
    const date = new Date().toISOString().slice(0, 10);

    return `footr-vendas-${date}.${format}`;
}

function downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function formatDate(value: string): string {
    return new Date(value).toLocaleString("pt-BR");
}

function escapeCsv(value: string | number | null): string {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
}

function exportJSON(sales: SaleDetails[]): void {
    const content = JSON.stringify(sales, null, 2);

    downloadFile(
        new Blob([content], {
            type: "application/json;charset=utf-8;",
        }),
        getFileName("json"),
    );
}

function exportCSV(sales: SaleDetails[]): void {
    const headers = [
        "Número da venda",
        "Data",
        "Cliente",
        "Pagamento",
        "Status",
        "Subtotal",
        "Desconto",
        "Total",
        "Código Footr",
        "Produto",
        "Time",
        "Temporada",
        "Tipo",
        "Versão",
        "Tamanho",
        "Custo unitário",
        "Preço unitário",
        "Total do item",
    ];

    const rows = sales.flatMap((sale) => {
        const items = sale.items.length > 0 ? sale.items : [null];

        return items.map((item) => [
            sale.saleNumber,
            formatDate(sale.soldAt),
            sale.customerName,
            paymentLabels[sale.paymentMethod],
            statusLabels[sale.status],
            sale.subtotal,
            sale.discountAmount,
            sale.totalAmount,
            item?.productCode ?? "",
            item?.productDescription ?? "",
            item?.teamName ?? "",
            item?.season ?? "",
            item?.type ?? "",
            item?.version ?? "",
            item?.size ?? "",
            item?.unitCost ?? "",
            item?.unitPrice ?? "",
            item?.lineTotal ?? "",
        ]);
    });

    const content = [
        headers.map(escapeCsv).join(";"),
        ...rows.map((row) => row.map(escapeCsv).join(";")),
    ].join("\r\n");

    downloadFile(
        new Blob(["\uFEFF", content], {
            type: "text/csv;charset=utf-8;",
        }),
        getFileName("csv"),
    );
}

async function exportXLSX(sales: SaleDetails[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Footr";
    workbook.created = new Date();

    const salesSheet = workbook.addWorksheet("Vendas");

    salesSheet.columns = [
        { header: "Número", key: "number", width: 14 },
        { header: "Data", key: "date", width: 22 },
        { header: "Cliente", key: "customer", width: 28 },
        { header: "Pagamento", key: "payment", width: 18 },
        { header: "Status", key: "status", width: 16 },
        { header: "Subtotal", key: "subtotal", width: 16 },
        { header: "Desconto", key: "discount", width: 16 },
        { header: "Total", key: "total", width: 16 },
        { header: "Quantidade de itens", key: "itemCount", width: 20 },
    ];

    salesSheet.addRows(
        sales.map((sale) => ({
            number: sale.saleNumber,
            date: new Date(sale.soldAt),
            customer: sale.customerName ?? "",
            payment: paymentLabels[sale.paymentMethod],
            status: statusLabels[sale.status],
            subtotal: sale.subtotal,
            discount: sale.discountAmount,
            total: sale.totalAmount,
            itemCount: sale.itemCount,
        })),
    );

    salesSheet.getColumn("date").numFmt = "dd/mm/yyyy hh:mm";
    ["subtotal", "discount", "total"].forEach((key) => {
        salesSheet.getColumn(key).numFmt = '"R$" #,##0.00';
    });

    const itemsSheet = workbook.addWorksheet("Itens");

    itemsSheet.columns = [
        { header: "Venda", key: "saleNumber", width: 14 },
        { header: "Data da venda", key: "date", width: 22 },
        { header: "Código Footr", key: "code", width: 18 },
        { header: "Produto", key: "description", width: 38 },
        { header: "Time", key: "team", width: 28 },
        { header: "Temporada", key: "season", width: 16 },
        { header: "Tipo", key: "type", width: 16 },
        { header: "Versão", key: "version", width: 16 },
        { header: "Tamanho", key: "size", width: 12 },
        { header: "Custo unitário", key: "cost", width: 18 },
        { header: "Preço unitário", key: "price", width: 18 },
        { header: "Desconto", key: "discount", width: 16 },
        { header: "Total do item", key: "total", width: 18 },
    ];

    itemsSheet.addRows(
        sales.flatMap((sale) =>
            sale.items.map((item) => ({
                saleNumber: sale.saleNumber,
                date: new Date(sale.soldAt),
                code: item.productCode,
                description: item.productDescription,
                team: item.teamName,
                season: item.season,
                type: item.type,
                version: item.version,
                size: item.size,
                cost: item.unitCost,
                price: item.unitPrice,
                discount: item.discountAmount,
                total: item.lineTotal,
            })),
        ),
    );

    itemsSheet.getColumn("date").numFmt = "dd/mm/yyyy hh:mm";

    ["cost", "price", "discount", "total"].forEach((key) => {
        itemsSheet.getColumn(key).numFmt = '"R$" #,##0.00';
    });

    for (const sheet of [salesSheet, itemsSheet]) {
        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = {
            from: "A1",
            to: {
                row: 1,
                column: sheet.columnCount,
            },
        };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    downloadFile(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        getFileName("xlsx"),
    );
}

export async function downloadSalesExport(
    sales: SaleDetails[],
    format: SalesExportFormat,
): Promise<void> {
    if (!sales.length) {
        throw new Error("Não existem vendas para exportar.");
    }

    switch (format) {
        case "json":
            exportJSON(sales);
            break;

        case "csv":
            exportCSV(sales);
            break;

        case "xlsx":
            await exportXLSX(sales);
            break;
    }
}
