"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/settings");
    }, 1500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black-100 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 border border-white/10 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3"
      >
        <CheckCircle2 className="text-purple-400" size={22} />
        <div className="text-sm">
          Redirecting you to your profile dashboard...
        </div>
      </motion.div>
    </div>
  );
}
