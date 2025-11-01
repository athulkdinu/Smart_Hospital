import React from "react";
import LandingHero from "../components/LandingHero";
import LandingFeatures from "../components/LandingFeatures";
import LandingAbout from "../components/LandingAbout";
import LandingStats from "../components/LandingStats";
import LandingContact from "../components/LandingContact";

export default function Landing() {
  return (
    <div className="overflow-x-hidden">
      <LandingHero />
      <LandingFeatures />
      <LandingAbout />
      <LandingStats />
      <LandingContact />
    </div>
  );
}
