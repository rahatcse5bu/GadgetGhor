import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = { title: 'Privacy Policy' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p className="text-sm leading-relaxed">
        GadgetGhor (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains
        what information we collect, how we use it, and the choices you have.
      </p>

      <Section title="1. Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Order details:</strong> name, phone, email, and delivery address.</li>
          <li><strong>Payment info:</strong> we store the payment method only — we do not store full card numbers.</li>
          <li><strong>Usage data:</strong> pages visited and device/browser info to improve the store.</li>
        </ul>
      </Section>

      <Section title="2. How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To process, deliver, and track your orders.</li>
          <li>To send order confirmations, status updates, and support replies via email.</li>
          <li>To improve our products, website, and customer experience.</li>
        </ul>
      </Section>

      <Section title="3. Sharing your information">
        <p>
          We share delivery details only with our courier partners to fulfill your order. We never
          sell your personal data. Service providers (email/SMS, payment processors) access data
          strictly to provide their service.
        </p>
      </Section>

      <Section title="4. Data security">
        <p>
          We use industry-standard measures to protect your data, including encrypted connections
          (HTTPS) and restricted access. No method of transmission is 100% secure, but we work hard
          to safeguard your information.
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          We use cookies/local storage to keep your cart, remember preferences, and analyze traffic.
          You can disable cookies in your browser, though some features (like the cart) may not work.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          You may request access to, correction of, or deletion of your personal data by emailing
          <strong> support@gadgetghor.com</strong>. We will respond within a reasonable timeframe.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions about this policy? Reach us at <strong>support@gadgetghor.com</strong> or
          +880 1700-000000.
        </p>
      </Section>
    </LegalLayout>
  );
}
