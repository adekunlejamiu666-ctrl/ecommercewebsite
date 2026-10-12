import React from "react";

export default function Footer() {
  return (
    <footer className="bg-near-black text-white py-3 mt-auto border-top-custom">
      <div className="container text-center small text-secondary">
        &copy; {new Date().getFullYear()} NEXORA Commerce Inc. All rights reserved.
      </div>
    </footer>
  );
}
