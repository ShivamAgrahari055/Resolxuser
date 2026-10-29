import './globals.css';

export const metadata = {
  title: 'ResolveX — College Grievance Redressal Portal',
  description: 'A secure, transparent grievance redressal portal for MNNIT Allahabad students.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}