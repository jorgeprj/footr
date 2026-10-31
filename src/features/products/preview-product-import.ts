"use server";

import { previewProductsFile } from "@/modules/products/server";

export async function previewProductImport(formData: FormData) {
    const file = formData.get("file");

    if (!(file instanceof File)) {
        throw new Error("Selecione um arquivo para importar.");
    }

    return previewProductsFile(file);
}