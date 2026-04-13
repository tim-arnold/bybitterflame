import { headers } from "next/headers";
import { UserNav } from "@/components/UserNav";
import { PageTransition } from "@/components/PageTransition";
import { SiteHeaderLogo } from "@/components/SiteHeaderLogo";
import { getAuth } from "@/lib/auth/index";
import { isAdmin } from "@/lib/auth/admin";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const adminUser = isAdmin(session);

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-30 h-[89px] grid grid-cols-3 items-center px-6 border-b border-stone-800 bg-stone-950/90">
        <div className="flex items-center">
          <UserNav section="left" isAdmin={adminUser} />
        </div>
        <div className="flex items-start justify-center overflow-visible">
          <SiteHeaderLogo />
        </div>
        <div className="flex items-center justify-end">
          <UserNav section="right" isAdmin={adminUser} />
        </div>
      </div>
      <div className="pt-[89px]">
        <PageTransition>{children}</PageTransition>
      </div>
    </>
  );
}
