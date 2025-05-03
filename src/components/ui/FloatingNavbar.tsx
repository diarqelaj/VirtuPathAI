"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { HiUserCircle, HiOutlineUser } from "react-icons/hi";
import { TbRoute } from "react-icons/tb";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { signOut } from "next-auth/react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;
      setVisible(scrollYProgress.get() < 0.05 || direction < 0);
    }
  });

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch {}
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.0 }}
        className={cn(
          "flex items-center w-fit max-w-[90vw] fixed z-[5000] top-4 right-4 md:top-10 md:inset-x-0 md:mx-auto",
          "px-4 py-2 md:px-10 md:py-5 rounded-lg border border-black/.1 shadow-lg",
          className
        )}
        style={{
          backdropFilter: "blur(16px) saturate(180%)",
          backgroundColor: "rgba(17, 25, 40, 0.75)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.125)",
          overflow: "visible",
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
          {navItems
            .filter((item) => !(item.name === "Log In" && user))
            .map((navItem, idx) => (
              <NavLink key={idx} navItem={navItem} />
            ))}
        </div>

        {!isMobile && (
          <div className="relative ml-4 flex items-center space-x-2">
            {user ? (
              <div
                className="cursor-pointer flex items-center space-x-1 text-white text-sm hover:text-neutral-300"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <HiUserCircle size={36} className="text-purple-400" />
                <span>{user.fullName || "User"}</span>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-neutral-100 hover:text-neutral-300 transition"
              >
                SIGN IN
              </Link>
            )}

            <AnimatePresence>
              {menuOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-full top-0 ml-2 w-52 rounded-xl bg-[rgba(17,25,40,0.9)] border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden z-50"
                >
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-5 py-3 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HiOutlineUser className="text-white" />
                    Profile
                  </Link>
                  <Link
                    href="/pathhub"
                    className="flex items-center gap-2 px-5 py-3 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <TbRoute className="text-white" />
                    Path Hub
                  </Link>
                  <div className="h-px bg-white/10 mx-3 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors duration-200"
                  >
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

          <AnimatePresence>
            {isOpen && isMobile && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20, x: 20 }}
                className="fixed right-4 top-16 bg-[rgba(17,25,40,0.95)] rounded-lg p-4 space-y-3 shadow-xl z-[9999]"
                style={{
                  backdropFilter: "blur(12px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.125)",
                  minWidth: "220px",
                }}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
                role="menu"
                aria-labelledby="mobile-menu"
              >
                {navItems
                  .filter((item) => !(item.name === "Log In" && user))
                  .map((navItem, idx) => (
                    <NavLink
                      key={idx}
                      navItem={navItem}
                      mobile
                      setIsOpen={setIsOpen}
                    />
                  ))}

                <div className="border-t border-white/10 pt-3 space-y-2">
                  {user ? (
                    <>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition"
                        onClick={() => setIsOpen(false)}
                      >
                        <HiOutlineUser className="text-white" />
                        Profile
                      </Link>
                      <Link
                        href="/pathhub"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition"
                        onClick={() => setIsOpen(false)}
                      >
                        <TbRoute className="text-white" />
                        Path Hub
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded-md transition"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block text-sm text-white px-3 py-2 hover:bg-white/10 rounded-md transition"
                      onClick={() => setIsOpen(false)}
                    >
                      SIGN IN
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
};

interface NavLinkProps {
  navItem: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  };
  mobile?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavLink = ({ navItem, mobile, setIsOpen }: NavLinkProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSmartNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isHash = navItem.link.startsWith("#");

    if (mobile && setIsOpen) {
      setIsOpen(false);
      (document.activeElement as HTMLElement)?.blur();
    }

    if (isHash) {
      e.preventDefault();
      if (pathname !== "/") {
        router.push(`/${navItem.link}`);
      } else {
        const target = document.querySelector(navItem.link);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState({}, "", navItem.link);
        }
      }
    }
  };

  return (
    <Link
      href={navItem.link}
      className={cn(
        "text-neutral-50 hover:text-neutral-300 transition-colors",
        mobile ? "block text-sm p-2" : "flex items-center space-x-1"
      )}
      onClick={handleSmartNavigation}
      scroll={false}
      role="menuitem"
    >
      {navItem.icon && <span className={mobile ? "mr-2" : ""}>{navItem.icon}</span>}
      <span className={mobile ? "text-base" : "text-sm"}>{navItem.name}</span>
    </Link>
  );
};
