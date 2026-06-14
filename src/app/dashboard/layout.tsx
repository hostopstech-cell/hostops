import { redirect } from "next/navigation";
import { getAuthenticatedOwner } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import DashboardClientWrapper from "@/components/DashboardClientWrapper";

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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar ownerName={owner.name} />
      <main className="lg:ml-64 px-4 pt-16 pb-8 lg:px-8 lg:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <DashboardClientWrapper>
            {children}
          </DashboardClientWrapper>
        </div>
      </main>
    </div>
  );
}
