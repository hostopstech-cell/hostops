"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const err = searchParams?.get("error");
    if (err === "partner_account") {
      setError("⚠️ This Google account is already registered as a referral partner. Please use a different account to sign in as an owner.");
    }
  }, [searchParams]);

  return <LoginModal onClose={() => router.push("/")} externalError={error} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
