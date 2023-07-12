'use client';
import './globals.css';
// import './sidebars.css';
import { Inter } from 'next/font/google';
import Sidebar from './sidebar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Create Next App',
//   description: 'Generated by create next app',
// };


export default function RootLayout({ children }) {
  const pathname = usePathname();
  const showHeader = pathname === '/users/new' || '/users/login' ? false : true;
  return (
    <html lang="en">
      <body className={inter.className}>
        {showHeader && <Sidebar />}
        <section className="main">
          {children}
        </section>
      </body>
    </html>
  );
}
