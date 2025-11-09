import React, { useRef } from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import CTASection from "../components/CTASection";
import Footer, { FooterHandles } from "../components/Footer";
import BookingTips from "../components/BookingTips";

const LandingPage: React.FC = () => {
  const footerRef = useRef<FooterHandles>(null);

  const scrollToAbout = () => footerRef.current?.scrollToAbout();
  const scrollToContact = () => footerRef.current?.scrollToContact();

  return (
    <IonPage id="main">
      <Header scrollToAbout={scrollToAbout} scrollToContact={scrollToContact} />
      <IonContent fullscreen>
        <HeroSection />
        <FeaturesSection />
        <BookingTips />
        <CTASection />
        <Footer ref={footerRef} />
      </IonContent>
    </IonPage>
  );
};

export default LandingPage;
