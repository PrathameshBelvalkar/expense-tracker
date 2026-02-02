import { api } from "./client";

export type OcrExtractResponse = { text: string };

export async function extractReceiptText(file: File): Promise<OcrExtractResponse> {
  const form = new FormData();
  form.append("file", file);
  const result = await api.postFormData<OcrExtractResponse>("/ocr/extract", form);
  if (!result.ok) throw new Error(result.error);
  return result.data ?? { text: "" };
}
