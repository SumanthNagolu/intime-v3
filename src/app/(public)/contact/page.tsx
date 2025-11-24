export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-24">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C87941] mb-4 block">Get in Touch</span>
            <h1 className="text-6xl font-heading font-bold mb-8">
              Ready for <br/>
              <span className="italic font-serif">Results?</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed">
              Whether you're an enterprise looking for talent or a professional looking for a career, we're ready to move at your speed.
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Email</h3>
                <p className="text-2xl hover:text-[#C87941] transition-colors cursor-pointer">hello@intime.com</p>
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Phone</h3>
                <p className="text-2xl hover:text-[#C87941] transition-colors cursor-pointer">+1 (307) 650-2850</p>
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Headquarters</h3>
                <p className="text-gray-400">
                  123 Innovation Drive<br/>
                  Tech District, Suite 400<br/>
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white text-black p-10">
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Name</label>
                <input type="text" className="w-full bg-[#F5F3EF] border-2 border-gray-200 p-4 focus:border-black focus:outline-none transition-colors" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
                <input type="email" className="w-full bg-[#F5F3EF] border-2 border-gray-200 p-4 focus:border-black focus:outline-none transition-colors" placeholder="jane@company.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Interest</label>
                <select className="w-full bg-[#F5F3EF] border-2 border-gray-200 p-4 focus:border-black focus:outline-none transition-colors">
                  <option>Hiring Talent</option>
                  <option>Joining Academy</option>
                  <option>Consulting Services</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Message</label>
                <textarea className="w-full bg-[#F5F3EF] border-2 border-gray-200 p-4 focus:border-black focus:outline-none transition-colors h-32" placeholder="Tell us about your needs..."></textarea>
              </div>
              <button type="submit" className="w-full bg-black text-white py-5 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
                Send Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


