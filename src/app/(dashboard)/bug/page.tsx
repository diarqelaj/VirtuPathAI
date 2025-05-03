"use client";

import { navItems } from "@/data";
import { useState } from "react";
import api from "@/lib/api";

export default function ReportBugPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    description: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("description", formData.description);
    if (screenshot) {
      data.append("screenshot", screenshot);
    }

    try {
      const res = await api.post("/bugreports", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 201) {
        setSubmitted(true);
      }
    } catch (err: any) {
      const error = err.response?.data?.error || "Something went wrong. Please try again.";
      setErrorMessage(error);
    }
  };

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <main className="flex-1 pt-37 pb-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center mb-12">
            Report a Bug
          </h1>

          {submitted ? (
            <div className="text-center text-green-400 text-lg">
              ✅ Thank you! Your bug report has been received.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              <div>
                <label htmlFor="name" className="block mb-2 text-white/80">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-black-800 text-white rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-white/80">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-black-800 text-white rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 text-white/80">
                  Describe the Issue
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                  className="w-full px-4 py-2 bg-black-800 text-white rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple"
                ></textarea>
              </div>

              <div className="space-y-2">
              <label htmlFor="screenshot" className="block text-white/80">
                Screenshot (optional)
              </label>

              <div className="relative border border-white/10 rounded-lg p-4 bg-black-800 flex flex-col items-center justify-center text-white/60 hover:border-purple-500 transition cursor-pointer">
                <label
                  htmlFor="screenshot"
                  className="flex flex-col items-center justify-center text-center cursor-pointer w-full h-40"
                >
                  {screenshot ? (
                    <img
                      src={URL.createObjectURL(screenshot)}
                      alt="Selected Screenshot"
                      className="max-h-36 object-contain rounded"
                    />
                  ) : (
                    <>
                      <span className="text-sm mb-2">Click to upload screenshot</span>
                      <span className="text-xs text-white/40">PNG, JPG, JPEG, WEBP</span>
                    </>
                  )}
                </label>
                <input
                  id="screenshot"
                  type="file"
                  accept="image/png, image/jpg, image/jpeg, image/webp"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>


              {errorMessage && (
                <div className="text-red-400 text-sm">{errorMessage}</div>
              )}

              <button
                type="submit"
                className="bg-purple hover:bg-purple/90 transition px-6 py-2 rounded-md text-white font-medium"
              >
                Submit Bug Report
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
