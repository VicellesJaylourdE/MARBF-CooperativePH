import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
} from "@ionic/react";
import {
  contractOutline,
  checkmarkCircleOutline,
  timeOutline,
  calendarOutline,
} from "ionicons/icons";

interface StatsProps {
  totalEquipment: number;
  availableNow: number;
  pendingBookings: number;
  activeRentals: number;
}

const StatsGrid: React.FC<StatsProps> = ({
  totalEquipment,
  availableNow,
  pendingBookings,
  activeRentals,
}) => {
  return (
    <IonGrid className="stats-grid">
      <IonRow>
        {/* Total Equipment - Green */}
        <IonCol size="6" sizeMd="3">
          <IonCard
            style={{
              border: "1.5px solid #28A745",
              borderRadius: "10px",
              padding: "0.5rem",
              margin: "0.4rem 0",
              textAlign: "center",
              backgroundColor: "#E6F4EA",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
            }}
          >
            <IonCardContent>
              <IonIcon icon={contractOutline} style={{ fontSize: "2rem", color: "#28A745" }} />
              <IonText
                style={{ fontSize: "2rem", fontWeight: 600, color: "#28A745" }}
              >
                {totalEquipment}
              </IonText>
              <p style={{ fontWeight: 500, color: "#28A745" }}>Total Equipment</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        {/* Available Now - Orange */}
        <IonCol size="6" sizeMd="3">
          <IonCard
            style={{
              border: "1.5px solid #FCB53B",
              borderRadius: "10px",
              padding: "0.5rem",
              margin: "0.4rem 0",
              textAlign: "center",
              backgroundColor: "#FFF7E6",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
            }}
          >
            <IonCardContent>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: "2rem", color: "#FCB53B" }} />
              <IonText
                style={{ fontSize: "2rem", fontWeight: 600, color: "#FCB53B" }}
              >
                {availableNow}
              </IonText>
              <p style={{ fontWeight: 500, color: "#FCB53B" }}>Available Now</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        {/* Pending Bookings - Yellow */}
        <IonCol size="6" sizeMd="3">
          <IonCard
            style={{
              border: "1.5px solid #ff0707ff",
              borderRadius: "10px",
              padding: "0.5rem",
              margin: "0.4rem 0",
              textAlign: "center",
              backgroundColor: "#FFF9E6",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
            }}
          >
            <IonCardContent>
              <IonIcon icon={timeOutline} style={{ fontSize: "2rem", color: "#ff0707ff" }} />
              <IonText
                style={{ fontSize: "2rem", fontWeight: 600, color: "#ff0707ff" }}
              >
                {pendingBookings}
              </IonText>
              <p style={{ fontWeight: 500, color: "#ff0000ff" }}>Pending Bookings</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        {/* Active Rentals - Blue */}
        <IonCol size="6" sizeMd="3">
          <IonCard
            style={{
              border: "1.5px solid #007BFF",
              borderRadius: "10px",
              padding: "0.5rem",
              margin: "0.4rem 0",
              textAlign: "center",
              backgroundColor: "#E6F0FF",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
            }}
          >
            <IonCardContent>
              <IonIcon icon={calendarOutline} style={{ fontSize: "2rem", color: "#007BFF" }} />
              <IonText
                style={{ fontSize: "2rem", fontWeight: 600, color: "#007BFF" }}
              >
                {activeRentals}
              </IonText>
              <p style={{ fontWeight: 500, color: "#007BFF" }}>Active Rentals</p>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default StatsGrid;
