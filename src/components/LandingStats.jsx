import React from "react";

const stats = [
  { label: "Departments", value: "10+" },
  { label: "Doctors", value: "150+" },
  { label: "Patients Served", value: "5K+" },
  { label: "Appointments Daily", value: "400+" },
];

export default function LandingStats() {
  return (
    <section className="py-16 bg-emerald-700 text-white text-center">
      <h2 className="text-3xl font-bold mb-10">Trusted by Thousands</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 md:px-20">
        {stats.map((s, i) => (
          <div key={i}>
            <p className="text-4xl font-extrabold">{s.value}</p>
            <p className="opacity-80">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
