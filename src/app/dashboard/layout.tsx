import { redirect } from "next/navigation";
import { getAuthenticatedOwner } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await getAuthenticatedOwner();

  if (!owner) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav ownerName={owner.name} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
