import { FaRobot } from "react-icons/fa6";
import { socialMedia } from "@/data";
import MagicButton from "./MagicButton";

const Footer = () => {
  return (
    <footer className="w-full pt-20 pb-10 bg-black-900 text-white relative overflow-hidden" id="contact">
      {/* Background Grid */}
      <div className="w-full absolute left-0 -bottom-72 min-h-96 opacity-50">
        <img src="/footer-grid.svg" alt="grid" className="w-full h-full" />
      </div>

      <div className="flex flex-col items-center text-center">
        <h1 className="heading lg:max-w-[45vw]">
          Empower Your Future 
        </h1>
        <p className="text-white-200 md:mt-10 my-5">
          Start your journey in AI-powered professional training today.  
          Gain skills, complete daily tasks, and unlock new career opportunities.
        </p>
        <a href="mailto:support@virtuweb.ai">
          <MagicButton
            title="Get Started Now"
            icon={<FaRobot />}
            position="right"
          />
        </a>
      </div>

      <div className="flex mt-16 md:flex-row flex-col justify-between items-center w-full px-6">
        <p className="md:text-base text-sm md:font-normal font-light">
          Copyright © 2025 Virtu Path AI. All rights reserved.
        </p>

        <div className="flex items-center md:gap-3 gap-6">
          {socialMedia.map((info) => (
            <a key={info.id} href={info.link} target="_blank" rel="noopener noreferrer">
              <div className="w-10 h-10 cursor-pointer flex justify-center items-center bg-opacity-75 bg-gray-800 rounded-lg border border-gray-600">
                <img src={info.img} alt={info.name} width={20} height={20} />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col md:flex-row justify-center items-center text-center gap-4 text-sm text-white-200">
        <a href="/about" className="hover:text-purple transition">About Us</a>
        <span className="hidden md:inline">|</span>
        <a href="/privacy-policy" className="hover:text-purple-color transition">Privacy Policy</a>
        <span className="hidden md:inline">|</span>
        <a href="/terms-of-service" className="hover:text-purple transition">Terms of Service</a>
        <span className="hidden md:inline">|</span>
        <a href="/contact" className="hover:text-purple transition">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
