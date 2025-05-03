"use client";

import { useEffect } from "react";
import { navItems } from "@/data";
import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Clients from "../components/Clients";
import Footer from "@/components/CFooter";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import Approach from "@/components/Approach";

const Home = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // small delay ensures everything is mounted
      }
    }
  }, []);

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-x-hidden overflow-y-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />
        <Hero />
        <Approach />
        <Grid />
        <Clients />
        <Footer />
      </div>
    </main>
  );
};

export default Home;
