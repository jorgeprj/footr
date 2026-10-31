import { NextRequest, NextResponse } from "next/server";

import { generateProductsExport } from "@/modules/products/server";

import type { ProductExportFormat } from "@/modules/products/adapters/files/product-exporter";

const SUPPORTED_FORMATS: ProductExportFormat[] = [
    "json",
    "csv",
    "xlsx",
];

export async function GET(request: NextRequest) {
    const format = request.nextUrl.searchParams.get("format");

    if (
        !format ||
        !SUPPORTED_FORMATS.includes(format as ProductExportFormat)
    ) {
        return NextResponse.json(
            {
                error: "Formato inválido. Utilize json, csv ou xlsx.",
            },
            { status: 400 },
        );
    }

    try {
        const file = await generateProductsExport(
            format as ProductExportFormat,
        );

        return new NextResponse(
            new Uint8Array(file.buffer),
            {
                status: 200,
                headers: {
                    "Content-Type": file.contentType,
                    "Content-Disposition": `attachment; filename="${file.fileName}"`,
                    "Content-Length": String(file.buffer.length),
                    "Cache-Control": "private, no-store",
                },
            },
        );
    } catch (error) {
        console.error("[PRODUCTS_EXPORT_ERROR]", error);

        return NextResponse.json(
            {
                error: "Não foi possível exportar os produtos.",
            },
            { status: 500 },
        );
    }
}