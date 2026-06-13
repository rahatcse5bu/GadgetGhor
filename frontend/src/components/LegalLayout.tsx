export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">Last updated: {updated}</p>
        <div className="prose-legal mt-8 space-y-6 text-slate-600">{children}</div>
      </div>
    </div>
  );
}
