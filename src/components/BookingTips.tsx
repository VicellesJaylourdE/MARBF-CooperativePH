import React, { useState } from "react"; 
import { IonGrid, IonRow, IonCol, IonIcon } from "@ionic/react";
import { chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import "../theme/BookingTips.css";

import bookingImage from "../assets/business_16722874.png";

const tips = [
  {
    title: "Plan Ahead",
    content: "Schedule your bookings in advance to avoid last-minute stress."
  },
  {
    title: "Set Reminders",
    content: "Use notifications to remind yourself of upcoming appointments."
  },
  {
    title: "Prioritize Important Tasks",
    content: "Focus on high-priority bookings first to manage your time effectively."
  },
  {
    title: "Confirm Details",
    content: "Double-check dates, times, and locations to avoid errors."
  },
  {
    title: "Keep Notes",
    content: "Maintain a simple log of bookings for easy reference."
  }
];

const BookingTips: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="booking-page">
      <IonGrid>
        <IonRow className="booking-row">
          <IonCol sizeMd="6" size="12" className="text-section">
            <h1 className="booking-title">
              Booking <span className="highlight">Tips</span>
            </h1>
            <p className="booking-subtitle">
              Simple strategies to make your booking process smoother and stress-free.
            </p>

            {tips.map((tip, index) => (
              <div
                key={index}
                className={`accordion-card ${openIndex === index ? "active" : ""}`}
                onClick={() => toggleAccordion(index)}
              >
                <div className="accordion-header">
                  <h3>{tip.title}</h3>
                  <IonIcon
                    icon={openIndex === index ? chevronUpOutline : chevronDownOutline}
                  />
                </div>
                {openIndex === index && (
                  <div className="accordion-content">
                    <p>{tip.content}</p>
                  </div>
                )}
              </div>
            ))}
          </IonCol>

          <IonCol sizeMd="6" size="12" className="image-section">
            <img
              src={bookingImage}
              alt="Booking tips illustration"
              className="booking-image"
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    </section>
  );
};

export default BookingTips;
