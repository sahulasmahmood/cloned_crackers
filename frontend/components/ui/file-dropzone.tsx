"use client";

import { useRef, useState, type DragEvent } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Comma-separated accept list, e.g. ".pdf,.jpg,.png" */
  accept?: string;
  maxSizeMB?: number;
  /** URL of an already-uploaded file (edit mode) */
  existingUrl?: string;
  disabled?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Reusable file upload area with click + drag-and-drop, inline validation,
 * and a selected-file preview. The standard replacement for a bare
 * <input type="file">.
 */
export function FileDropzone({
  file,
  onFileChange,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSizeMB = 5,
  existingUrl,
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = (f: File | null) => {
    setError(null);
    if (!f) {
      onFileChange(null);
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum ${maxSizeMB}MB.`);
      return;
    }
    const allowed = accept
      .split(",")
      .map((s) => s.trim().replace(".", "").toLowerCase())
      .filter(Boolean);
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (allowed.length && !allowed.includes(ext)) {
      setError(`Unsupported file type. Allowed: ${allowed.join(", ")}.`);
      return;
    }
    onFileChange(f);
  };

  const clearFile = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files?.[0] || null);
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      className="hidden"
      disabled={disabled}
      onChange={(e) => validateAndSet(e.target.files?.[0] || null)}
    />
  );

  // Selected-file preview card
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={clearFile}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
        {hiddenInput}
      </div>
    );
  }

  // Empty dropzone
  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-sm">
          <span className="font-medium text-primary">Click to upload</span>{" "}
          <span className="text-muted-foreground">or drag and drop</span>
        </div>
        <p className="text-xs text-muted-foreground">PDF or image, up to {maxSizeMB}MB</p>
        {hiddenInput}
      </div>

      {existingUrl ? (
        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <FileText className="h-3.5 w-3.5" /> View current document
        </a>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
