import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "./ui/CanvasRevealEffect";

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  des: string;
}

interface AceternityIconProps {
  order: string;
}

const Approach = () => {
  return (
    <section id="approach" className="w-full py-20">
      <h1 className="heading">
        How it <span className="text-purple">works</span>
      </h1>
      <div className="my-20 flex flex-col lg:flex-row items-center justify-center w-full gap-4">
        <Card
          title="Choose your career path"
          icon={<AceternityIcon order="Phase 1" />}
          des="Browse through unique career paths and pick the one that matches your ambitions."
        >
          <CanvasRevealEffect
            animationSpeed={5.1}
            containerClassName="bg-indigo-900 rounded-3xl overflow-hidden"
          />
        </Card>
        <Card
          title="Start your journey"
          icon={<AceternityIcon order="Phase 2" />}
          des="Receive daily tasks tailored to your goals and enjoy a structured experience."
        >
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-teal-900 rounded-3xl overflow-hidden"
            colors={[[32, 201, 151], [255, 255, 255]]}
            dotSize={2}
          />
        </Card>
        <Card
          title="Track your progress"
          icon={<AceternityIcon order="Phase 3" />}
          des="Analyze your performance and celebrate your progress with detailed insights."
        >
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-cyan-600 rounded-3xl overflow-hidden"
            colors={[[103, 232, 249]]}
          />
        </Card>
      </div>
    </section>
  );
};

export default Approach;

const Card: React.FC<CardProps> = ({ title, icon, children, des }) => {
  const [isActive, setIsActive] = React.useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(!isActive)} // Toggle on mobile tap
      className="border border-black/[0.2] group/canvas-card flex items-center justify-center 
        dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative lg:h-[35rem] rounded-3xl
        touch-pan-y cursor-pointer transition-all duration-300 ease-in-out"
      style={{
        background: "rgb(2,12,28)",
        backgroundColor: "linear-gradient(90deg, rgba(2,12,28,1) 0%, rgba(15,32,62,1) 100%)",
      }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0 pointer-events-none"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 px-10 w-full">
        <div className={`text-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
          ${isActive ? 'opacity-0' : 'opacity-100'} transition-all duration-300 min-w-40 mx-auto`}>
          {icon}
        </div>
        <h2 className={`dark:text-white text-center text-3xl 
          ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          relative z-10 mt-4 font-bold text-white transition-all duration-300`}>
          {title}
        </h2>
        <p className={`text-sm ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          relative z-10 mt-4 text-center transition-all duration-300`}
          style={{ color: "#E4ECFF" }}>
          {des}
        </p>
      </div>
    </div>
  );
};

const AceternityIcon: React.FC<AceternityIconProps> = ({ order }) => {
  return (
    <button className="relative inline-flex overflow-hidden rounded-full p-[1px] focus:outline-none">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] 
        bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center
        rounded-full bg-slate-950 px-5 py-2 text-purple backdrop-blur-3xl font-bold text-2xl
        transition-all duration-300 hover:scale-105">
        {order}
      </span>
    </button>
  );
};