import React from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonToolbar,
  IonTitle,
  IonMenuButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const LandingPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      {/* ✅ Navbar with Responsive Menu */}
      <IonToolbar color="light">
        {/* Left Section: Menu Button + Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Mobile menu button (hidden on desktop) */}
            <div className="ion-hide-md-up">
              <IonMenuButton slot="start" autoHide={false} />
            </div>

            <IonTitle
              style={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                marginLeft: "0.5rem",
              }}
            >
              🚜 Coop PaBOOKid
            </IonTitle>
          </div>

          {/* Right Section: Desktop Navbar Buttons */}
          <div className="ion-hide-sm-down">
            <IonButton fill="clear" onClick={() => history.push("/booking")}>
              Booking
            </IonButton>
            <IonButton fill="clear" onClick={() => history.push("/about")}>
              About Us
            </IonButton>
            <IonButton fill="clear" onClick={() => history.push("/contact")}>
              Contact
            </IonButton>
            <IonButton fill="clear" onClick={() => history.push("/login")}>
              Sign In
            </IonButton>
            <IonButton color="success" onClick={() => history.push("/register")}>
              Get Started
            </IonButton>
          </div>
        </div>
      </IonToolbar>

      {/* ✅ Content */}
      <IonContent className="ion-padding" fullscreen>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            padding: "2rem 1rem",
            backgroundColor: "#f5f0e6",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
            Modern Equipment Booking for{" "}
            <span style={{ color: "#2f6627" }}>Agricultural Cooperatives</span>
          </h1>
          <p style={{ fontSize: "1rem", marginTop: "1rem", color: "#666" }}>
            Streamline equipment rentals for the Mantibugao Agrarian Reform
            Beneficiaries Farmers Cooperative with our comprehensive digital
            booking system.
          </p>

          <div style={{ marginTop: "1.5rem" }}>
            <IonButton onClick={() => history.push("/booking")} color="success">
              Start Booking
            </IonButton>
            <IonButton
              fill="outline"
              style={{ marginLeft: "1rem" }}
              onClick={() => history.push("/learnmore")}
            >
              Learn More
            </IonButton>
          </div>
        </div>

        {/* Features Section */}
        <IonGrid className="ion-margin-top">
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <h2 style={{ fontWeight: "bold" }}>
                Everything You Need to Manage Equipment Rentals
              </h2>
              <p>
                Built specifically for agricultural cooperatives to streamline
                operations and improve efficiency.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            {[
              {
                title: "Equipment Management",
                desc: "Track inventory, availability status, and maintenance.",
                icon: "🚜",
              },
              {
                title: "Easy Booking",
                desc: "Calendar-integrated, real-time rental scheduling.",
                icon: "📅",
              },
              {
                title: "Member Management",
                desc: "Role-based access control for all users.",
                icon: "👥",
              },
              {
                title: "Analytics & Reports",
                desc: "Track usage, revenue, and performance metrics.",
                icon: "📊",
              },
            ].map((feature, index) => (
              <IonCol size="12" sizeMd="3" key={index}>
                <div
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    margin: "1rem 0",
                  }}
                >
                  <div style={{ fontSize: "2rem" }}>{feature.icon}</div>
                  <h3 style={{ fontWeight: "bold", marginTop: "1rem" }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    {feature.desc}
                  </p>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* About Us Section */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "3rem 1rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.8rem",
              color: "#2f6627",
            }}
          >
            About Us
          </h2>
          <p
            style={{
              maxWidth: "700px",
              margin: "1rem auto",
              fontSize: "1rem",
              color: "#444",
            }}
          >
            Coop PaBOOKid is a digital platform designed to help the Mantibugao
            Agrarian Reform Beneficiaries Farmers Cooperative streamline
            equipment rentals and improve operational efficiency. Our mission is
            to empower farmers through technology, making modern equipment
            accessible and easy to manage.
          </p>
        </div>

        {/* CTA Section */}
        <div
          style={{
            backgroundColor: "#2f6627",
            color: "#fff",
            padding: "4rem 1rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
            Ready to Modernize Your Equipment Management?
          </h2>
          <p
            style={{
              maxWidth: "700px",
              margin: "1rem auto",
              fontSize: "1rem",
            }}
          >
            Join the Mantibugao Agrarian Reform Beneficiaries Farmers Cooperative
            in embracing digital transformation for better agricultural outcomes.
          </p>
          <IonButton
            style={{
              marginTop: "1.5rem",
              padding: "0.8rem 2rem",
              fontSize: "1rem",
              borderRadius: "8px",
            }}
            color="light"
            onClick={() => history.push("/register")}
          >
            Get Started Today →
          </IonButton>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTop: "1px solid #ccc",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <strong>Coop PaBOOKid</strong>
          </div>
          <small style={{ color: "#666" }}>
            © 2025 Mantibugao Agrarian Reform Beneficiaries Farmers Cooperative.
            All rights reserved.
          </small>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LandingPage;