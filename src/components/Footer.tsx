import { socialMedia, footerLinks } from "@/data";

const Footer = () => {
  return (
    <footer
      className="w-full mt-32 pt-20 pb-10 bg-black-900 text-white relative overflow-hidden"
      id="contact"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/footer-grid.svg')" }}
      />

      {/* Footer Grid Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-6 md:px-20 relative z-10">
        {/* Column: Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            {footerLinks.company.map((item) => (
              <li key={item.name}>
                <a href={item.link} className="hover:text-white transition">
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column: Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            {footerLinks.legal.map((item) => (
              <li key={item.name}>
                <a href={item.link} className="hover:text-white transition">
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column: Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            {footerLinks.support.map((item) => (
              <li key={item.name}>
                <a href={item.link} className="hover:text-white transition">
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column: Social Media */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            {socialMedia.map((info) => (
              <a
                key={info.id}
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex justify-center items-center bg-gray-800 rounded-md border border-gray-600 hover:bg-gray-700 transition"
              >
                <img src={info.img} alt={info.name} width={20} height={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-white/40 text-sm border-t border-white/10 pt-6 mt-10 px-6 md:px-20 relative z-10">
        © 2025 Virtu Path AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
