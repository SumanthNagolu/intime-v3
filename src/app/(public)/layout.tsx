import CorporateNavbar from '@/components/marketing/CorporateNavbar';
import CorporateFooter from '@/components/marketing/CorporateFooter';

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EF] text-black font-body">
      <CorporateNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <CorporateFooter />
    </div>
  );
}


