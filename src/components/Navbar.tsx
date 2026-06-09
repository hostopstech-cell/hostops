"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/solutions", label: "Solutions" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <span className="font-bold text-slate-900 text-lg">HostOps</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors pb-0.5 ${
              pathname === link.href
                ? "text-orange-600 font-semibold border-b-2 border-orange-600"
                : "hover:text-orange-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">🎁 7 Days Free</span>
        <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
        <Link href="/dashboard" className="bg-orange-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Dashboard</Link>
      </div>
    </nav>
  );
}
