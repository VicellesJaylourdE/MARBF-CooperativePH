import React, { forwardRef, useImperativeHandle, useRef, Ref } from "react";
import { Mail, Facebook, Linkedin } from "lucide-react";
import "../theme/Footer.css";

export interface FooterHandles {
  scrollToAbout: () => void;
  scrollToContact: () => void;
}

interface FooterProps {} // No extra props

const Footer = forwardRef<FooterHandles, FooterProps>((props, ref: Ref<FooterHandles>) => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToAbout: () => aboutRef.current?.scrollIntoView({ behavior: "smooth" }) || undefined,
    scrollToContact: () => contactRef.current?.scrollIntoView({ behavior: "smooth" }) || undefined,
  }));

  return (
    <footer className="footer">
      <div className="footer-container">
  
        <div className="footer-column">
          <div className="footer-logo">
          
            <h2>MARBF Cooperative</h2>
          </div>
          <p>
            Modernizing equipment rentals for Mantibugao Agrarian Reform
            Beneficiaries Farmers Cooperative.
          </p>
        </div>

        <div className="footer-column" ref={aboutRef}>
          <h3>About Us</h3>
          <ul>
            <li>Mantibugao, Bukidnon</li>
            <li>Philippines</li>
          </ul>
        </div>

        <div className="footer-column" ref={contactRef}>
          <h3>Customer Support</h3>
          <ul>
            <li>Email: coopbookid@mail.com</li>
            <li>Phone: +63 912 345 6789</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Connect</h3>
          <div className="footer-icons">
            <a href="#"><Mail /></a>
            <a href="#"><Facebook /></a>
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
