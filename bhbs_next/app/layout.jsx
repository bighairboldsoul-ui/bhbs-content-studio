import './globals.css';

export const metadata = {
  title: 'BHBS Content Studio',
  description: 'AI-powered content production for Big Hair Bold Soul',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
