'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Add product</h1>
      <ProductForm />
    </div>
  );
}
