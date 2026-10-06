import { AdminShell } from "@/components/layout/admin-shell";
import { hasAdminPermission, requireAdminPage } from "@/lib/admin-auth";
import { db } from "@/lib/db";
export default async function AdminLayout({children}:{children:React.ReactNode}){const user=await requireAdminPage();const unread=hasAdminPermission(user,"notifications:read")?await db.adminNotification.count({where:{readAt:null}}):null;return <AdminShell user={{name:user.name,email:user.email,role:user.role}} unread={unread}>{children}</AdminShell>}
