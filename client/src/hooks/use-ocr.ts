import { useMutation } from "@tanstack/react-query";
import { extractReceiptText } from "@/api/ocr";

export type ExtractReceiptVariables = { file: File; uploadId: string };

export function useExtractReceiptMutation() {
  return useMutation({
    mutationFn: ({ file }: ExtractReceiptVariables) => extractReceiptText(file),
    onSuccess: (data) => {
      console.log("OCR extract result:", data);
    },
    onError: (err: Error) => {
      console.error("OCR extract error:", err);
    },
  });
}
