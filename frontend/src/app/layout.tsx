import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'GadgetGhor — Imported Gadgets & Accessories in Bangladesh',
    template: '%s · GadgetGhor',
  },
  description:
    'Premium mobile, laptop and electronics accessories imported from China and delivered across Bangladesh. Genuine products, fast delivery, cash on delivery.',
  keywords: [
    'gadgets bangladesh',
    'mobile accessories',
    'laptop accessories',
    'power bank',
    'earbuds',
    'GadgetGhor',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '10px', background: '#234a58', color: '#fff' },
          }}
        />
      </body>
    </html>
  );
}
