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
      {/* ✅ Navbar */}
      <IonToolbar color="light">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
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
        <div
          style={{
            textAlign: "center",
            padding: "2rem 1rem",
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
              color="success"
            >
              Learn More
            </IonButton>
          </div>
        </div>

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
                title: "Equipment",
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
                    border: "1.50px solid #FCB53B",
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

        <div
          style={{
            backgroundColor: "#FCB53B",
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

        {/* ✅ Footer */}
        <div
          style={{
            backgroundColor: "var(--ion-background-color)",
            color: "var(--ion-text-color)",
            padding: "2rem 1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTop: "1px solid #FCB53B",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              maxWidth: "1000px",
              width: "100%",
            }}
          >
            {/* Logo + Slogan */}
            <div style={{ flex: "1 1 200px", margin: "1rem" }}>
              <h2 style={{ fontWeight: "bold" }}>🚜 Coop PaBOOKid</h2>
              <p>Modernizing Equipment Rentals for Farmers</p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <IonButton fill="clear" size="small">FB</IonButton>
                <IonButton fill="clear" size="small">IG</IonButton>
                <IonButton fill="clear" size="small">X</IonButton>
                <IonButton fill="clear" size="small">in</IonButton>
              </div>
            </div>

            {/* About Us */}
            <div style={{ flex: "1 1 150px", margin: "1rem" }}>
              <h4>ABOUT US</h4>
              <p>Mantibugao, Bukidnon</p>
              <p>Philippines</p>
            </div>

            {/* Legal Stuff */}
            <div style={{ flex: "1 1 150px", margin: "1rem" }}>
              <h4>LEGAL STUFF</h4>
              <p>Terms of Service</p>
              <p>Privacy Policy</p>
              <p>Refund Policy</p>
              <p>FAQ</p>
            </div>

            {/* Support */}
            <div style={{ flex: "1 1 150px", margin: "1rem" }}>
              <h4>CUSTOMER SUPPORT</h4>
              <p>Email: coopbookid@mail.com</p>
              <p>Phone: +63 912 345 6789</p>
            </div>
          </div>

          {/* Bottom Line */}
          <div style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
            © 2025 Coop PaBOOKid. All Rights Reserved.
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LandingPage;
