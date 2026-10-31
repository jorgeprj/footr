import ExcelJS from "exceljs-community";

import type { ProductInput } from "../../domain/product";
import { ProductFileRow } from "../../domain/product-import";

type ImportedProductRow = ProductInput;

const HEADER_ALIASES: Record<keyof ImportedProductRow, string[]> = {
    teamName: ["team_name", "team", "time", "nome do time"],
    season: ["season", "temporada"],
    type: ["type", "tipo", "tipo de camisa"],
    version: ["version", "versao", "versão"],
    size: ["size", "tamanho"],
    costPrice: [
        "cost_price",
        "cost",
        "preco de custo",
        "preço de custo",
    ],
    salePrice: [
        "sale_price",
        "sale",
        "preco de venda",
        "preço de venda",
    ],
};

function normalizeHeader(value: unknown): string {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
}

function normalizeValue(value: unknown): unknown {
    if (
        value !== null &&
        typeof value === "object" &&
        "text" in value
    ) {
        return value.text;
    }

    return value;
}

function parsePrice(value: unknown): number | null {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== "string") {
        return null;
    }

    const normalized = value
        .trim()
        .replace(/R\$/gi, "")
        .replace(/\s/g, "");

    if (!normalized) {
        return null;
    }

    const brazilianFormat = normalized.includes(",");

    const parsed = brazilianFormat
        ? Number(normalized.replace(/\./g, "").replace(",", "."))
        : Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
}

function mapHeaders(headers: unknown[]) {
    const mapping: Partial<Record<number, keyof ImportedProductRow>> = {};

    headers.forEach((header, index) => {
        const normalized = normalizeHeader(header);

        for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
            if (
                aliases.some(
                    (alias) => normalizeHeader(alias) === normalized,
                )
            ) {
                mapping[index] = field as keyof ImportedProductRow;
                break;
            }
        }
    });

    return mapping;
}

function mapRow(
    values: unknown[],
    mapping: Partial<Record<number, keyof ImportedProductRow>>,
    rowNumber: number,
): ProductFileRow {
    const data: ProductFileRow["data"] = {};

    for (const [index, field] of Object.entries(mapping)) {
        if (!field) {
            continue;
        }

        const value = normalizeValue(values[Number(index)]);

        if (field === "costPrice" || field === "salePrice") {
            data[field] = parsePrice(value) ?? value;
        } else {
            data[field] = value;
        }
    }

    return {
        rowNumber,
        data,
    };
}
function parseCsv(content: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let insideQuotes = false;

    for (let index = 0; index < content.length; index++) {
        const character = content[index];
        const nextCharacter = content[index + 1];

        if (character === '"' && insideQuotes && nextCharacter === '"') {
            field += '"';
            index++;
        } else if (character === '"') {
            insideQuotes = !insideQuotes;
        } else if (character === "," && !insideQuotes) {
            row.push(field);
            field = "";
        } else if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {
            if (character === "\r" && nextCharacter === "\n") {
                index++;
            }

            row.push(field);

            if (row.some((value) => value.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            field = "";
        } else {
            field += character;
        }
    }

    row.push(field);

    if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
    }

    return rows;
}

function rowsFromCsv(content: string): ProductFileRow[] {
    const rows = parseCsv(content);

    if (rows.length < 2) {
        return [];
    }

    const mapping = mapHeaders(rows[0]);

    return rows.slice(1).map((row, index) =>
        mapRow(row, mapping, index + 2),
    );
}

async function rowsFromExcel(
    file: File,
): Promise<ProductFileRow[]> {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(
        await file.arrayBuffer(),
    );

    const worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 2) {
        return [];
    }

    const headers = worksheet.getRow(1).values as unknown[];
    const mapping = mapHeaders(headers.slice(1));

    const rows: ProductFileRow[] = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            return;
        }

        const values = row.values as unknown[];

        rows.push(
            mapRow(values.slice(1), mapping, rowNumber),
        );
    });

    return rows;
}

function rowsFromJson(content: string): ProductFileRow[] {
    const parsed: unknown = JSON.parse(content);

    if (!Array.isArray(parsed)) {
        throw new Error("O arquivo JSON deve conter uma lista de produtos.");
    }

    return parsed.map((item, index) => {
        if (
            typeof item !== "object" ||
            item === null ||
            Array.isArray(item)
        ) {
            throw new Error(
                `Registro ${index + 1}: formato de produto inválido.`,
            );
        }

        const data: ProductFileRow["data"] = {};
        const record = item as Record<string, unknown>;

        for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
            const matchingKey = Object.keys(record).find(
                (key) =>
                    aliases.some(
                        (alias) =>
                            normalizeHeader(alias) === normalizeHeader(key),
                    ),
            );

            if (matchingKey !== undefined) {
                const value = record[matchingKey];
                const typedField = field as keyof ImportedProductRow;

                data[typedField] =
                    typedField === "costPrice" ||
                    typedField === "salePrice"
                        ? parsePrice(value) ?? value
                        : value;
            }
        }

        return {
            rowNumber: index + 1,
            data,
        };
    });
}

export async function readProductFile(
    file: File,
): Promise<ProductFileRow[]> {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
        return rowsFromCsv(await file.text());
    }

    if (extension === "xlsx") {
        return rowsFromExcel(file);
    }

    if (extension === "json") {
        return rowsFromJson(await file.text());
    }

    throw new Error(
        "Formato não suportado. Utilize CSV, XLSX ou JSON.",
    );
}