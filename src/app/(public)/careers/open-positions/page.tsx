import Link from 'next/link';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

const JOBS = [
  {
    id: 'gw-dev-senior',
    title: 'Senior Guidewire Developer',
    location: 'Remote / US',
    type: 'Contract',
    department: 'Engineering'
  },
  {
    id: 'salesforce-architect',
    title: 'Salesforce Technical Architect',
    location: 'Hybrid - NYC',
    type: 'Contract-to-Hire',
    department: 'Engineering'
  },
  {
    id: 'fullstack-lead',
    title: 'Lead Full Stack Engineer',
    location: 'Remote',
    type: 'Direct Hire',
    department: 'Product'
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist (AI/ML)',
    location: 'San Francisco, CA',
    type: 'Contract',
    department: 'Data'
  }
];

export default function OpenPositionsPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <section className="py-24 bg-white border-b-2 border-black">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl font-heading font-bold mb-8">Open Positions</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Current opportunities to join our network of elite consultants.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid gap-6">
          {JOBS.map((job) => (
            <div key={job.id} className="bg-white border-2 border-black p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h3 className="text-2xl font-heading font-bold mb-2">{job.title}</h3>
                 <div className="flex items-center gap-6 text-gray-600 text-sm">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {job.type}</span>
                    <span className="uppercase tracking-widest font-bold text-xs bg-gray-100 px-2 py-1">{job.department}</span>
                 </div>
              </div>
              <Link href={`/careers/jobs/${job.id}`}>
                 <button className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
                    Apply Now <ArrowRight className="w-4 h-4" />
                 </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


