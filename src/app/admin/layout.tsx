import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
export default async function AdminLayout({children}:{children:React.ReactNode}){const user=await requireAdminPage();return <AdminShell user={{name:user.name,email:user.email,role:user.role}}>{children}</AdminShell>}
