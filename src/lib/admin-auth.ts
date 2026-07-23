import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
export const ADMIN_PERMISSIONS = ["dashboard:read","orders:read","orders:write","products:read","products:write","customers:read","customers:write","staff:read","staff:write","reports:read","settings:write"] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];
const rolePermissions: Record<UserRole, readonly AdminPermission[]> = { CUSTOMER:[], ADMIN:ADMIN_PERMISSIONS, ORDER_MANAGER:["dashboard:read","orders:read","orders:write","customers:read"], PRODUCT_MANAGER:["dashboard:read","products:read","products:write","reports:read"], SUPPORT_STAFF:["dashboard:read","orders:read","customers:read","customers:write"] };
export async function getVerifiedUser(){ const session=await auth.api.getSession({headers:await headers()}); if(!session?.user?.id)return null; return db.user.findUnique({where:{id:session.user.id},select:{id:true,name:true,email:true,image:true,emailVerified:true,role:true,permissions:true,accessEnabled:true}}); }
export type VerifiedUser=NonNullable<Awaited<ReturnType<typeof getVerifiedUser>>>;
export function hasAdminPermission(user:VerifiedUser,permission:AdminPermission){return user.emailVerified&&user.accessEnabled&&user.role!=="CUSTOMER"&&(rolePermissions[user.role].includes(permission)||user.permissions.includes(permission));}
export async function requireAdminPage(permission:AdminPermission="dashboard:read"){const user=await getVerifiedUser();if(!user)redirect("/login?redirect=/admin");if(!hasAdminPermission(user,permission))redirect("/forbidden");return user;}
export async function requireAdminApi(permission:AdminPermission){const user=await getVerifiedUser();if(!user)return{error:Response.json({error:"Authentication required"},{status:401})}as const;if(!hasAdminPermission(user,permission))return{error:Response.json({error:"Insufficient permission"},{status:403})}as const;return{user}as const;}
