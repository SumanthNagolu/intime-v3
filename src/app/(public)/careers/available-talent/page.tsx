import { User } from 'lucide-react';

const TALENT = [
  { id: 1, role: "Sr. Guidewire Dev", exp: "8 Years", loc: "Remote" },
  { id: 2, role: "Salesforce Architect", exp: "10 Years", loc: "NYC" },
  { id: 3, role: "Java Full Stack", exp: "6 Years", loc: "Toronto" },
  { id: 4, role: "Data Engineer", exp: "5 Years", loc: "Austin" },
];

export default function AvailableTalentPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Available Talent</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Pre-vetted consultants ready to deploy in 48 hours.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {TALENT.map((t) => (
            <div key={t.id} className="bg-white border-2 border-black p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.role}</h3>
                <p className="text-sm text-gray-500">{t.exp} • {t.loc}</p>
              </div>
              <button className="ml-auto text-xs font-bold uppercase bg-[#C87941] text-white px-3 py-1">
                Reserve
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


