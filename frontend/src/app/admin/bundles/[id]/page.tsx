'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BundleForm from '@/components/admin/BundleForm';

export default function EditBundlePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <Link href="/admin/bundles" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to bundles
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Edit bundle</h1>
      <BundleForm bundleId={id} />
    </div>
  );
}
