import React from "react";
import { HeartPulse, ShieldCheck, Calendar, MessageCircle } from "lucide-react";

const features = [
  {
    icon: <HeartPulse size={40} className="text-emerald-500" />,
    title: "Smart AI Scheduling",
    desc: "Automated appointment booking and real-time doctor availability.",
  },
  {
    icon: <ShieldCheck size={40} className="text-emerald-500" />,
    title: "Secure Patient Data",
    desc: "HIPAA-compliant storage ensuring top-tier privacy and safety.",
  },
  {
    icon: <Calendar size={40} className="text-emerald-500" />,
    title: "Unified Medical Records",
    desc: "Seamless access for patients, doctors, and administrators.",
  },
  {
    icon: <MessageCircle size={40} className="text-emerald-500" />,
    title: "24/7 Virtual Support",
    desc: "Instant assistance from our AI-powered hospital chatbot.",
  },
];

export default function LandingFeatures() {
  return (
    <section className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold text-emerald-700 mb-12">
        Why Choose MediConnect?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-8 md:px-20">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 bg-emerald-50 rounded-2xl shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex justify-center mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold text-emerald-700 mb-2">
              {f.title}
            </h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
