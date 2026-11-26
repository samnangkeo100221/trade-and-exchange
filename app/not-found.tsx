import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-amber-400 mb-2 font-mono">404</h1>
        <h2 className="text-xl font-bold mb-3">រកមិនឃើញទំព័រ (Page Not Found)</h2>
        <p className="text-slate-400 text-sm mb-6">
          ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរទីតាំង។
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
        >
          ត្រឡប់ទៅទំព័រដើម
        </Link>
      </div>
    </div>
  );
}
