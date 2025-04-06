import { FaLocationArrow } from "react-icons/fa6";
import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-100"> {/* Changed to bg-100 */}
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center bg-100 dark:bg-grid-white/[0.03] bg-grid-black-100/[0.03]" 
      >
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center bg-100 
         [mask-image:radial-gradient(ellipse_at_center,transparent_5%,black)]"
        />
      </div>

      <div className="relative z-10 text-center max-w-[850vw] md:max-w-3xl lg:max-w-[75vw] flex flex-col items-center overlflow-visible">
        <p className="uppercase tracking-widest text-xs text-blue-100 max-w-70">
          Your journey to greatness begins here
        </p>

        <TextGenerateEffect
          words="Virtu Path AI"
          className="text-[40px] md:text-5xl lg:text-6xl"
        />

        <p className="md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl">
          Unleash your potential. Elevate your skills. Master your field.
        </p>

        <div className="w-full flex justify-center mt-4">
        <Link href="/careers" className="text-center max-w-[300px] block">
          <MagicButton
            title="Get started"
            icon={null}
            position=""
          />
        </Link>
      </div>
      </div>
    </div>
  );
};

export default Hero;