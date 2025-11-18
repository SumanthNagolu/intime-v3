export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#integrations" className="hover:text-white">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Solutions</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#training" className="hover:text-white">Training Academy</a></li>
              <li><a href="#recruiting" className="hover:text-white">Recruiting</a></li>
              <li><a href="#bench" className="hover:text-white">Bench Sales</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#careers" className="hover:text-white">Careers</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#docs" className="hover:text-white">Documentation</a></li>
              <li><a href="#help" className="hover:text-white">Help Center</a></li>
              <li><a href="#api" className="hover:text-white">API</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div>© {currentYear} IntimeESolutions. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white">Privacy</a>
            <a href="#terms" className="hover:text-white">Terms</a>
            <a href="#security" className="hover:text-white">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
