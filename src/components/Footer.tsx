import { FaRobot } from "react-icons/fa6";
import { socialMedia } from "@/data";
import MagicButton from "./MagicButton";

const Footer = () => {
  return (
    <footer
      className="w-full min-h-[400px] pt-20 pb-10 bg-black-900 text-white relative overflow-hidden bg-[url('/footer-grid.svg')] bg-cover bg-center bg-no-repeat"
      id="contact"
    >
      {/* No need for extra <img> now */}
      <div className="flex mt-16 md:flex-row flex-col justify-between items-center w-full px-6 relative z-10">
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

      <div className="mt-10 flex flex-col md:flex-row justify-center items-center text-center gap-4 text-sm text-white-200 relative z-10">
        <a href="/about" className="hover:text-purple transition">About Us</a>
        <span className="hidden md:inline">|</span>
        <a href="/privacy-policy" className="hover:text-purple transition">Privacy Policy</a>
        <span className="hidden md:inline">|</span>
        <a href="/terms-of-service" className="hover:text-purple transition">Terms of Service</a>
        <span className="hidden md:inline">|</span>
        <a href="/contact" className="hover:text-purple transition">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
