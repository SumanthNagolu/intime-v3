import NewNavbar from '@/components/academy/NewNavbar';
import NewAIMentor from '@/components/academy/NewAIMentor';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <NewNavbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-24 max-w-7xl">
        {children}
      </main>
      <NewAIMentor />
    </div>
  );
}
