import Link from "next/link";

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="h-16 px-6 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-lg bg-fg text-bg grid place-items-center font-serif text-lg">
            M
          </span>
          <span className="font-serif text-lg">Maison Admin</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
