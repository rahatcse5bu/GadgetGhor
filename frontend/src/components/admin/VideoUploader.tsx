'use client';
import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';

export default function VideoUploader({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/upload/video', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
      toast.success('Video uploaded');
    } catch (err) {
      toast.error(apiError(err, 'Video upload failed — check Cloudinary config'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Paste a YouTube / Vimeo link or video URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-outline whitespace-nowrap px-4"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <><Upload size={16} /> Upload</>}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="grid w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Remove video"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      {value && !compact && (
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={value} controls className="max-h-48 w-full" preload="metadata" />
        </div>
      )}
    </div>
  );
}
