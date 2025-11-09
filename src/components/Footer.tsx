import React, { forwardRef, useImperativeHandle, useRef, Ref } from "react";
import { Mail, Github, Linkedin } from "lucide-react";
import "../theme/Footer.css";

export interface FooterHandles {
  scrollToAbout: () => void;
  scrollToContact: () => void;
}

interface FooterProps {} // No extra props

const Footer = forwardRef<FooterHandles, FooterProps>((props, ref: Ref<FooterHandles>) => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Expose scroll functions to parent via ref
  useImperativeHandle(ref, () => ({
    scrollToAbout: () => aboutRef.current?.scrollIntoView({ behavior: "smooth" }) || undefined,
    scrollToContact: () => contactRef.current?.scrollIntoView({ behavior: "smooth" }) || undefined,
  }));

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo / Description */}
        <div className="footer-column">
          <div className="footer-logo">
            <div className="logo-icon">🏡</div>
            <h2>MARBF Cooperative</h2>
          </div>
          <p>
            Modernizing equipment rentals for Mantibugao Agrarian Reform
            Beneficiaries Farmers Cooperative.
          </p>
        </div>

        {/* About Us */}
        <div className="footer-column" ref={aboutRef}>
          <h3>About Us</h3>
          <ul>
            <li>Mantibugao, Bukidnon</li>
            <li>Philippines</li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="footer-column" ref={contactRef}>
          <h3>Customer Support</h3>
          <ul>
            <li>Email: coopbookid@mail.com</li>
            <li>Phone: +63 912 345 6789</li>
          </ul>
        </div>

        {/* Connect */}
        <div className="footer-column">
          <h3>Connect</h3>
          <div className="footer-icons">
            <a href="#"><Mail /></a>
            <a href="#"><Github /></a>
            <a href="#"><Linkedin /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 MARBF Cooperative. All Rights Reserved.
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
export default Footer;
