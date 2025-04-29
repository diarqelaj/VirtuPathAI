"use client";

import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import { navItems } from "@/data";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !message) {
      setError("Please fill out all fields.");
      return;
    }

    console.log({ name, email, message });
    setSuccess("Message sent successfully!");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black-100 text-white relative">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-28 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-10 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="mt-2 text-gray-400">We would love to hear from you !</p>
            </div>

            {(error || success) && (
              <div className={`mb-6 p-3 rounded-lg text-sm ${error ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                {error || success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group relative">
                <UserIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="group relative">
                <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="group relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your Message"
                  rows={5}
                  className="w-full pl-4 pr-4 pt-3 pb-3 bg-black/30 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:opacity-90 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
