import { FaRobot } from "react-icons/fa6";
import { socialMedia, footerLinks } from "@/data";
import MagicButton from "./MagicButton";

const Footer = () => {
  return (
    <footer className="w-full pt-20 pb-10 bg-black-900 text-white relative overflow-hidden" id="contact">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-50">
        <img src="/footer-grid.svg" alt="grid" className="w-full h-full object-cover" />
      </div>

      {/* Hero Call to Action */}
      <div className="flex flex-col items-center text-center relative z-10">
        <h1 className="heading lg:max-w-[45vw]">Empower Your Future</h1>
        <p className="text-white-200 md:mt-10 my-5 max-w-xl">
          Start your journey in AI-powered professional training today.  
          Gain skills, complete daily tasks, and unlock new career opportunities.
        </p>
        <a href="mailto:support@virtuweb.ai">
          <MagicButton title="Get Started Now" icon={<FaRobot />} position="right" />
        </a>
      </div>

      {/* Footer Grid Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-20 px-6 md:px-20 relative z-10">
        {/* Column: Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            {footerLinks.company.map((item) => (
              <li key={item.name}>
                <a href={item.link} className="hover:text-white transition">{item.name}</a>
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
                <a href={item.link} className="hover:text-white transition">{item.name}</a>
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
                <a href={item.link} className="hover:text-white transition">{item.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column: Social Icons */}
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

      {/* Footer Bottom Line */}
      <div className="text-center text-white/40 text-sm border-t border-white/10 pt-6 mt-10 relative z-10">
        © 2025 Virtu Path AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
