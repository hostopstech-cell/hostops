"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const links = [
    { href: "/", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/solutions", label: "Solutions" },
    { href: "/about", label: "About Us" },
    { href: "/support", label: "Support" },
  ];

  return (
    <>
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">HostOps</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={`transition-colors pb-0.5 ${pathname===link.href ? "text-orange-600 font-semibold border-b-2 border-orange-600" : "hover:text-orange-600"}`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">🎁 7 Days Free</span>
            <button onClick={()=>setShowLogin(true)} className="hidden md:block text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">Login</button>
            <Link href="/dashboard" className="bg-orange-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Dashboard</Link>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-1">
              <span className={`block w-6 h-0.5 bg-slate-700 transition-all ${menuOpen?"rotate-45 translate-y-2":""}`}/>
              <span className={`block w-6 h-0.5 bg-slate-700 transition-all ${menuOpen?"opacity-0":""}`}/>
              <span className={`block w-6 h-0.5 bg-slate-700 transition-all ${menuOpen?"-rotate-45 -translate-y-2":""}`}/>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={()=>setMenuOpen(false)}
                className={`text-sm font-medium ${pathname===link.href?"text-orange-600":"text-slate-600"}`}>
                {link.label}
              </Link>
            ))}
            <button onClick={()=>{setMenuOpen(false);setShowLogin(true);}} className="text-sm text-slate-600 text-left font-medium">Login</button>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium w-fit">🎁 7 Days Free</span>
          </div>
        )}
      </nav>

      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} />}
    </>
  );
}
