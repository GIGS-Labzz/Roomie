"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, X } from "lucide-react";

interface DocumentUploadSlotProps {
  title: string;
  description: string;
  acceptTypes?: string;
  maxSizeMB?: number;
  value?: string | null;
  onUploadComplete: (url: string) => void;
  disabled?: boolean;
}

export function DocumentUploadSlot({
  title,
  description,
  acceptTypes = ".jpg,.jpeg,.png,.pdf",
  maxSizeMB = 5,
  value,
  onUploadComplete,
  disabled,
}: DocumentUploadSlotProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit (${maxSizeMB}MB). Please select a smaller file.`);
      return;
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);

    // Simulate Supabase Storage upload or mock storage path
    setTimeout(() => {
      setUploading(false);
      const mockStoragePath = `verifications/docs/${Date.now()}_${file.name}`;
      onUploadComplete(mockStoragePath);
    }, 1500);
  };

  const handleRemove = () => {
    setFileName(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </label>

      {value || fileName ? (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-xs">
                {fileName || value}
              </p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Document Attached
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            disabled || uploading
              ? "opacity-50 pointer-events-none border-slate-200"
              : "border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50 dark:bg-slate-900"
          }`}
        >
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {uploading ? "Uploading Document..." : "Click to upload or drag & drop"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{description}</p>
        </label>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
