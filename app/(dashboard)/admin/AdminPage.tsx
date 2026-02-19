import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminReports } from "@/actions/admin";
import { AdminDashboard } from "./components/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const reports = await getAdminReports();
  return <AdminDashboard reports={reports} />;
}
