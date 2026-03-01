import { SiteNav } from "@/components/SiteNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <div className="pt-12">{children}</div>
    </>
  );
}
