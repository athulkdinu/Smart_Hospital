import React from "react";
import { Link } from "react-router-dom";

export default function LandingContact() {
  return (
    <footer className="py-20 bg-emerald-800 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Experience Smart Care?</h2>
      <p className="text-emerald-100 mb-8">
        Connect, manage, and heal — all in one place.
      </p>
      <Link
        to="/login"
        className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-emerald-100 transition"
      >
        Get Started
      </Link>
      <p className="mt-10 text-sm text-emerald-200">
        © 2025 MediConnect. All Rights Reserved.
      </p>
    </footer>
  );
}
