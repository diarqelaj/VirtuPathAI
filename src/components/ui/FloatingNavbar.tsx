"use client";
import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;
      setVisible(scrollYProgress.get() < 0.05 || direction < 0);
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex max-w-fit fixed z-[5000] top-4 right-4 md:top-10 md:inset-x-0 md:mx-auto",
          "px-4 py-2 md:px-10 md:py-5 rounded-lg border border-black/.1 shadow-lg",
          className
        )}
        style={{
          backdropFilter: "blur(16px) saturate(180%)",
          backgroundColor: "rgba(17, 25, 40, 0.75)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.125)",
        }}
      >
        <button
          className="md:hidden p-1 text-neutral-50 transition-transform hover:scale-110 active:scale-95"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Navigation menu"
        >
          {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>

        <div className="hidden md:flex space-x-4">
          {navItems.map((navItem, idx) => (
            <NavLink key={idx} navItem={navItem} />
          ))}
        </div>

        <AnimatePresence>
          {isOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className="fixed right-4 top-16 bg-[rgba(17,25,40,0.95)] mt-2 rounded-lg p-4 space-y-3 shadow-xl"
              style={{
                backdropFilter: "blur(12px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.125)",
                minWidth: "200px",
              }}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
              role="menu"
              aria-labelledby="mobile-menu"
            >
              {navItems.map((navItem, idx) => (
                <NavLink 
                  key={idx} 
                  navItem={navItem} 
                  mobile 
                  setIsOpen={setIsOpen} // PROPERLY PASS SETISOPEN HERE
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

// UPDATED NAVLINK COMPONENT WITH PROPER PROPS
interface NavLinkProps {
  navItem: {
    name: string;
    link: string;
    icon?: JSX.Element;
  };
  mobile?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavLink = ({ navItem, mobile, setIsOpen }: NavLinkProps) => (
  <Link
    href={navItem.link}
    className={cn(
      "text-neutral-50 hover:text-neutral-300 transition-colors",
      mobile ? "block text-sm p-2" : "flex items-center space-x-1"
    )}
    onClick={(e) => {
      if (mobile && setIsOpen) { // SAFELY CHECK FOR SETISOPEN
        setIsOpen(false);
        (document.activeElement as HTMLElement)?.blur();
      }
      
      if (navItem.link.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(navItem.link);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          
          if (history.pushState) {
            history.pushState(null, '', navItem.link);
          } else {
            window.location.hash = navItem.link;
          }
        }
      }
    }}
    role="menuitem"
  >
    {navItem.icon && <span className={mobile ? "mr-2" : ""}>{navItem.icon}</span>}
    <span className={mobile ? "text-base" : "text-sm"}>{navItem.name}</span>
  </Link>
);