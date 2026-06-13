'use client';
import { PlayCircle } from 'lucide-react';

// Convert common video links into an embeddable form.
// Returns { type: 'iframe' | 'file', src } or null if unusable.
export function resolveVideo(url: string): { type: 'iframe' | 'file'; src: string } | null {
  if (!url) return null;
  const u = url.trim();

  // YouTube: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID
  const yt =
    u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };

  // Vimeo: vimeo.com/ID
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };

  // Direct video file / Cloudinary
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u) || /\/video\/upload\//.test(u)) {
    return { type: 'file', src: u };
  }

  // Fallback: try to embed as an iframe (some hosts allow it)
  return { type: 'iframe', src: u };
}

export default function ProductVideo({ url, poster }: { url: string; poster?: string }) {
  const resolved = resolveVideo(url);
  if (!resolved) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
        <PlayCircle size={18} className="text-brand-500" /> Product video
      </h3>
      <div className="card relative aspect-video overflow-hidden bg-black">
        {resolved.type === 'file' ? (
          <video
            src={resolved.src}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full"
          />
        ) : (
          <iframe
            src={resolved.src}
            title="Product video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
