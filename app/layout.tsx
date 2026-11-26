import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cambodia Market & Gold Pulse (តាមដានតម្លៃមាស អត្រាប្ដូរប្រាក់ ប្រេង និង ICT)',
  description: 'កម្មវិធីតាមដានតម្លៃមាសអន្តរជាតិនិងកម្ពុជា (គិតជាអោន និង តម្លឹង) អត្រាប្ដូរប្រាក់ USD/KHR/CNY តម្លៃប្រេងឥន្ធនៈ វិភាគបច្ចេកទេស ICT និងផ្ញើសារ Telegram',
  openGraph: {
    title: 'Cambodia Market & Gold Pulse (តាមដានតម្លៃមាស អត្រាប្ដូរប្រាក់ ប្រេង និង ICT)',
    description: 'កម្មវិធីតាមដានតម្លៃមាសអន្តរជាតិនិងកម្ពុជា (គិតជាអោន និង តម្លឹង) អត្រាប្ដូរប្រាក់ USD/KHR/CNY តម្លៃប្រេងឥន្ធនៈ វិភាគបច្ចេកទេស ICT និងផ្ញើសារ Telegram',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cambodia Market & Gold Pulse (តាមដានតម្លៃមាស អត្រាប្ដូរប្រាក់ ប្រេង និង ICT)',
    description: 'កម្មវិធីតាមដានតម្លៃមាសអន្តរជាតិនិងកម្ពុជា (គិតជាអោន និង តម្លឹង) អត្រាប្ដូរប្រាក់ USD/KHR/CNY តម្លៃប្រេងឥន្ធនៈ វិភាគបច្ចេកទេស ICT និងផ្ញើសារ Telegram',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500/20 selection:text-amber-300 font-['Kantumruy_Pro','Plus_Jakarta_Sans',sans-serif]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
