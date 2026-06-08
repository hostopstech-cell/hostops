import { redirect } from "next/navigation";
import { getAuthenticatedOwner } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar ownerName={owner.name} />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
