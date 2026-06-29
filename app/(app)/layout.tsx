import { AppNav } from "@/components/layout/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppNav />
      <main className="flex-1 px-5 pb-24 pt-8 md:px-10 md:pb-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
