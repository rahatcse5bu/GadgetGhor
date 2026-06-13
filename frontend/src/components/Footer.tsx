import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-x grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
              G
            </span>
            <span className="text-lg font-bold text-brand-800">GadgetGhor</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Premium gadgets &amp; accessories imported from China, delivered
            across Bangladesh. Genuine products, fair prices.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Shop</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/shop" className="hover:text-brand-600">All products</Link></li>
            <li><Link href="/shop?category=mobile-accessories" className="hover:text-brand-600">Mobile accessories</Link></li>
            <li><Link href="/shop?category=laptop-accessories" className="hover:text-brand-600">Laptop accessories</Link></li>
            <li><Link href="/bundles" className="hover:text-brand-600">Bundle deals</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Help</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/track" className="hover:text-brand-600">Track your order</Link></li>
            <li><Link href="/return-policy" className="hover:text-brand-600">Return policy</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-600">Privacy policy</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Get in touch</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li className="flex items-center gap-2"><Phone size={15} /> +880 1700-000000</li>
            <li className="flex items-center gap-2"><Mail size={15} /> support@gadgetghor.com</li>
            <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5" /> Dhaka, Bangladesh</li>
          </ul>
          <div className="mt-3 flex gap-3 text-slate-400">
            <a href="#" aria-label="Facebook" className="hover:text-brand-600"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-brand-600"><Instagram size={18} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4">
        <div className="container-x flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} GadgetGhor. All rights reserved.</p>
          <p>Cash on Delivery · bKash · Nagad · Card</p>
        </div>
      </div>
    </footer>
  );
}
