import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiAward, FiFeather, FiGlobe } from "react-icons/fi";

export default function About() {
  return (
    <div className="about-page py-5 bg-white">
      <div className="container">
        {/* Hero Section */}
        <div className="text-center py-5 border-bottom-custom mb-5">
          <span className="badge-custom badge-custom-black mb-3">OUR MANIFESTO</span>
          <h1 className="display-4 fw-bolder text-black mb-3">The Nexora Ethos</h1>
          <p className="lead text-medium mx-auto" style={{ maxWidth: "680px" }}>
            Born from a desire for uncompromising restraint. We create elevated essentials designed around monochromatic clarity, timeless materials, and architectural utility.
          </p>
        </div>

        {/* Narrative & Visual */}
        <div className="row g-5 align-items-center mb-5 pb-4">
          <div className="col-lg-6">
            <h2 className="fw-bold text-black mb-3">Designed for Permanence</h2>
            <p className="text-medium mb-3">
              In a marketplace inundated with seasonal disposability and loud marketing, NEXORA offers an antidote: a unified catalog where every single product exists with purpose.
            </p>
            <p className="text-medium mb-4">
              From our titanium precision watches and virgin merino outerwear to aerospace-grade acoustics and ceramic homeware, every object is vetted through rigorous ergonomic and durability criteria.
            </p>
            <Link to="/shop" className="btn btn-dark-custom py-3 px-4">
              Explore The Catalog <FiArrowRight />
            </Link>
          </div>
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000&auto=format&fit=crop"
              alt="Nexora Studio"
              className="img-fluid border-custom shadow-sm"
              style={{ borderRadius: "2px", aspectRatio: "4/3", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="row g-4 py-5 border-top-custom">
          <div className="col-md-4">
            <div className="p-4 border-custom bg-light-custom h-100">
              <div className="p-2 border-custom rounded bg-white text-black d-inline-block mb-3">
                <FiFeather size={24} />
              </div>
              <h5 className="fw-bold text-black mb-2">Monochromatic Purity</h5>
              <p className="text-medium small mb-0">
                Stripping away unnecessary visual clutter allows the true form, silhouette, and tactile texture of every material to speak with authority.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 border-custom bg-light-custom h-100">
              <div className="p-2 border-custom rounded bg-white text-black d-inline-block mb-3">
                <FiAward size={24} />
              </div>
              <h5 className="fw-bold text-black mb-2">Master Craftsmanship</h5>
              <p className="text-medium small mb-0">
                We partner with dedicated generational studios and artisans across Japan, Italy, Portugal, and Germany, ensuring ethical practices and rigorous longevity.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 border-custom bg-light-custom h-100">
              <div className="p-2 border-custom rounded bg-white text-black d-inline-block mb-3">
                <FiGlobe size={24} />
              </div>
              <h5 className="fw-bold text-black mb-2">Sustainable Footprint</h5>
              <p className="text-medium small mb-0">
                100% plastic-free packaging, low-impact carbon logistics, and lifetime repair support on all core mechanical and hardware pieces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
