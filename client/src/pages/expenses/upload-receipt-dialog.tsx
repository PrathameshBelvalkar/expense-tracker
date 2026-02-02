import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useExtractReceiptMutation } from "@/hooks/use-ocr";
import { extractAmountFromReceiptText } from "@/lib/receipt-utils";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_EXT = /\.(png|jpe?g)$/i;

function validateReceiptFile(file: File): { valid: true } | { valid: false; message: string } {
  if (!ALLOWED_EXT.test(file.name)) {
    return { valid: false, message: "Only JPG and PNG images are allowed." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, message: "Image must be 3 MB or less." };
  }
  return { valid: true };
}

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "completed";
}

type UploadReceiptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOcrSuccess?: (data: { amount: number }) => void;
};

export function UploadReceiptDialog({
  open,
  onOpenChange,
  onOcrSuccess,
}: UploadReceiptDialogProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const filesByIdRef = useRef<Map<string, File>>(new Map());
  const mutateExtract = useExtractReceiptMutation();

  useEffect(() => {
    if (!open) {
      setUploads([]);
      filesByIdRef.current.clear();
    }
  }, [open]);

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const addFile = (file: File) => {
    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    processFile(file);
  };

  const processFile = (file: File) => {
    const id = crypto.randomUUID();
    setUploads((prev) => [
      ...prev,
      { id, name: file.name, progress: 0, status: "uploading" },
    ]);
    filesByIdRef.current.set(id, file);
    mutateExtract.mutate(
      { file, uploadId: id },
      {
        onSuccess: (data, { uploadId }) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, progress: 100, status: "completed" } : u
            )
          );
          if (data.text.trim()) {
            const { amount } = extractAmountFromReceiptText(data.text);
            onOcrSuccess?.({ amount });
            onOpenChange(false);
          }
        },
        onError: (_, { uploadId }) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, progress: 100, status: "completed" } : u
            )
          );
        },
      }
    );
  };

  useEffect(() => {
    if (uploads.some((u) => u.status === "uploading")) {
      const interval = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.status === "uploading" && u.progress < 90
              ? { ...u, progress: u.progress + 10 }
              : u
          )
        );
      }, 300);
      return () => clearInterval(interval);
    }
  }, [uploads.some((u) => u.status === "uploading")]);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file) addFile(file);
      }
    }
    event.target.value = "";
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        if (file) addFile(file);
      }
    }
  };

  const removeUploadById = (id: string) => {
    filesByIdRef.current.delete(id);
    setUploads((prev) => prev.filter((file) => file.id !== id));
  };

  const activeUploads = uploads.filter((f) => f.status === "uploading");
  const completedUploads = uploads.filter((f) => f.status === "completed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-y-6">
          <Card
            className="group flex max-h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-4 border-dashed py-8 text-sm transition-colors hover:bg-muted/50"
            onDragOver={onDragOver}
            onDrop={onDropFiles}
            onClick={openFilePicker}
          >
            <div className="grid space-y-3">
              <div className="flex items-center gap-x-2 text-muted-foreground">
                <Upload className="size-5" />
                <div>
                  Drop files here or{" "}
                  <Button
                    variant="link"
                    className="h-auto p-0 font-normal text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFilePicker();
                    }}
                  >
                    browse files
                  </Button>{" "}
                  to add
                </div>
              </div>
            </div>
            <input
              ref={filePickerRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png"
              multiple
              onChange={onFileInputChange}
            />
            <span className="mt-2 block text-center text-base/6 text-muted-foreground group-disabled:opacity-50 sm:text-xs">
              Receipt image should be clear. JPG or PNG only, max 3 MB.
            </span>
          </Card>

          <div className="flex flex-col gap-y-4">
            {activeUploads.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center font-mono text-lg font-normal uppercase text-foreground sm:text-xs">
                  <Loader2 className="mr-1 size-4 animate-spin" />
                  Uploading
                </h2>
                <div className="-mt-2 divide-y">
                  {activeUploads.map((file) => (
                    <div key={file.id} className="group flex items-center py-4">
                      <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                        <FileText className="inline size-4 group-hover:hidden" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hidden size-4 p-0 group-hover:inline h-auto"
                          onClick={() => removeUploadById(file.id)}
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="mb-1 flex w-full flex-col">
                        <div className="flex justify-between gap-2">
                          <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                            {file.name}
                          </span>
                          <span className="tabular-nums text-sm text-muted-foreground">
                            {file.progress}%
                          </span>
                        </div>
                        <Progress
                          value={file.progress}
                          className="mt-1 h-2 min-w-64"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeUploads.length > 0 && completedUploads.length > 0 && (
              <Separator className="my-0" />
            )}

            {completedUploads.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center font-mono text-lg font-normal uppercase text-foreground sm:text-xs">
                  <CheckCircle className="mr-1 size-4" />
                  Finished
                </h2>
                <div className="-mt-2 divide-y">
                  {completedUploads.map((file) => (
                    <div key={file.id} className="group flex items-center py-4">
                      <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                        <FileText className="inline size-4 group-hover:hidden" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hidden size-4 p-0 group-hover:inline h-auto"
                          onClick={() => removeUploadById(file.id)}
                          aria-label="Remove"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="mb-1 flex w-full flex-col">
                        <div className="flex justify-between gap-2">
                          <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                            {file.name}
                          </span>
                          <span className="tabular-nums text-sm text-muted-foreground">
                            {file.progress}%
                          </span>
                        </div>
                        <Progress
                          value={file.progress}
                          className="mt-1 h-2 min-w-64"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
