
import React from "react";
import { IonGrid, IonRow, IonCol } from "@ionic/react";
import "../theme/FeaturesSection.css";

const FeaturesSection: React.FC = () => {
  const features = [
    { title: "Equipment", desc: "Track inventory, availability status, and maintenance.", icon: "🚜" },
    { title: "Easy Booking", desc: "Calendar-integrated, real-time rental scheduling.", icon: "📅" },
    { title: "Member Management", desc: "Role-based access control for all users.", icon: "👥" },
    { title: "Analytics & Reports", desc: "Track usage, revenue, and performance metrics.", icon: "📊" },
  ];

  return (
    <IonGrid className="features-section ion-margin-top">
      <IonRow className="ion-text-center">
        <IonCol size="12">
          <h2>Everything You Need to Manage Equipment Rentals</h2>
          <p>Built specifically for agricultural cooperatives to streamline operations and improve efficiency.</p>
        </IonCol>
      </IonRow>

      <IonRow>
        {features.map((feature, index) => (
          <IonCol size="12" sizeMd="3" key={index}>
            <div className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          </IonCol>
        ))}
      </IonRow>
    </IonGrid>
  );
};

export default FeaturesSection;
