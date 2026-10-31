import "server-only";

import type { Product } from "../../domain/product";
import ExcelJS from "exceljs-community";

export type ProductExportFormat = "json" | "csv" | "xlsx";

export interface ExportedProductFile {
    buffer: Buffer;
    contentType: string;
    fileName: string;
}

const CSV_HEADERS = [
    "footr_code",
    "team_name",
    "season",
    "type",
    "version",
    "size",
    "cost_price",
    "sale_price",
    "status",
    "created_at",
];

function mapProduct(product: Product) {
    return {
        footr_code: product.footrCode,
        team_name: product.teamName,
        season: product.season,
        type: product.type,
        version: product.version,
        size: product.size,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        status: product.status,
        created_at: product.createdAt,
    };
}

function escapeCsvValue(value: string | number): string {
    const stringValue = String(value);

    if (/[",\r\n;]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

function exportJson(products: Product[]): Buffer {
    const data = products.map(mapProduct);

    return Buffer.from(
        JSON.stringify(data, null, 2),
        "utf-8",
    );
}

function exportCsv(products: Product[]): Buffer {
    const rows = products.map((product) => {
        const mappedProduct = mapProduct(product);

        return CSV_HEADERS.map((header) =>
            escapeCsvValue(
                mappedProduct[header as keyof typeof mappedProduct],
            ),
        ).join(";");
    });

    const content = [
        CSV_HEADERS.join(";"),
        ...rows,
    ].join("\r\n");

    // BOM para facilitar a abertura correta no Excel.
    return Buffer.from(`\uFEFF${content}`, "utf-8");
}

async function exportXlsx(products: Product[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Footr";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Produtos");

    worksheet.columns = [
        { header: "footr_code", key: "footr_code", width: 20 },
        { header: "team_name", key: "team_name", width: 28 },
        { header: "season", key: "season", width: 14 },
        { header: "type", key: "type", width: 16 },
        { header: "version", key: "version", width: 16 },
        { header: "size", key: "size", width: 12 },
        { header: "cost_price", key: "cost_price", width: 16 },
        { header: "sale_price", key: "sale_price", width: 16 },
        { header: "status", key: "status", width: 16 },
        { header: "created_at", key: "created_at", width: 24 },
    ];

    worksheet.addRows(products.map(mapProduct));

    worksheet.getRow(1).font = {
        bold: true,
    };

    worksheet.getColumn("cost_price").numFmt = '"R$" #,##0.00';
    worksheet.getColumn("sale_price").numFmt = '"R$" #,##0.00';

    worksheet.views = [
        {
            state: "frozen",
            ySplit: 1,
        },
    ];

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(arrayBuffer);
}

export async function exportProductsFile(
    products: Product[],
    format: ProductExportFormat,
): Promise<ExportedProductFile> {
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `footr-produtos-${date}`;

    switch (format) {
        case "json":
            return {
                buffer: exportJson(products),
                contentType: "application/json; charset=utf-8",
                fileName: `${fileName}.json`,
            };

        case "csv":
            return {
                buffer: exportCsv(products),
                contentType: "text/csv; charset=utf-8",
                fileName: `${fileName}.csv`,
            };

        case "xlsx":
            return {
                buffer: await exportXlsx(products),
                contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName: `${fileName}.xlsx`,
            };

        default:
            throw new Error("Formato de exportação não suportado.");
    }
}