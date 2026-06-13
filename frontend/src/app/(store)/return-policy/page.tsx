import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = { title: 'Return & Refund Policy' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function ReturnPolicyPage() {
  return (
    <LegalLayout title="Return & Refund Policy" updated="June 2026">
      <p className="text-sm leading-relaxed">
        At GadgetGhor, your satisfaction matters. If something isn&apos;t right with your order,
        we offer a straightforward return and refund process within <strong>7 days</strong> of delivery.
      </p>

      <Section title="1. Eligibility for returns">
        <ul className="list-disc space-y-1 pl-5">
          <li>Return requests must be made within <strong>7 days</strong> of receiving your order.</li>
          <li>The item must be unused, in its original packaging, with all accessories and free gifts included.</li>
          <li>Proof of purchase (order number) is required.</li>
        </ul>
      </Section>

      <Section title="2. Damaged, defective or wrong items">
        <p>
          If you receive a damaged, defective, or incorrect product, contact us within
          <strong> 48 hours</strong> of delivery with photos/video. We will arrange a free
          replacement or full refund — including delivery charges.
        </p>
        <p className="text-slate-500">
          Tip: please record an unboxing video for electronics; it helps us resolve claims faster.
        </p>
      </Section>

      <Section title="3. Non-returnable items">
        <ul className="list-disc space-y-1 pl-5">
          <li>Items damaged due to misuse, drops, or unauthorized repair.</li>
          <li>Products with missing serial numbers, accessories, or original packaging.</li>
          <li>Earbuds/headphones where the hygiene seal is broken (unless defective).</li>
        </ul>
      </Section>

      <Section title="4. How to request a return">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Email <strong>support@gadgetghor.com</strong> or call +880 1700-000000 with your order number.</li>
          <li>Our team confirms eligibility and shares a return address / pickup option.</li>
          <li>Pack the item securely and hand it to the courier.</li>
        </ol>
      </Section>

      <Section title="5. Refunds">
        <p>
          Once we receive and inspect the returned item, refunds are processed within
          <strong> 5–7 business days</strong> to your original payment method (bKash/Nagad/bank).
          For Cash on Delivery orders, refunds are issued via mobile banking.
        </p>
      </Section>

      <Section title="6. Warranty">
        <p>
          Products marked with a warranty are covered against manufacturing defects for the stated
          period. Warranty claims are handled separately from the 7-day return window — contact
          support with your order number to begin a claim.
        </p>
      </Section>
    </LegalLayout>
  );
}
