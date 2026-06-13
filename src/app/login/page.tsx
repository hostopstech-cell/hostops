"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const err = searchParams?.get("error");
    if (err === "partner_account") {
      setError("⚠️ This Google account is already registered as a referral partner. Please use a different account to sign in as an owner.");
    }
  }, [searchParams]);

  return (
    <LoginModal
      onClose={() => router.push("/")}
      externalError={error}
    />
  );
}
