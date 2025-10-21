import React from "react";
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonText, IonIcon } from "@ionic/react";
import { contractOutline, calendarOutline, cashOutline, peopleOutline } from "ionicons/icons";

interface DashboardCardsProps {
  totalEquipment: number;
  todayBookings: number;
  totalRevenue: number;
  totalUsers: number;
}

const AdminDashboardCards: React.FC<DashboardCardsProps> = ({
  totalEquipment,
  todayBookings,
  totalRevenue,
  totalUsers,
}) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="6" sizeMd="3">
          <IonCard style={{ border: "1.5px solid #28A745", borderRadius: 10, padding: "0.5rem", margin: "0.4rem 0", textAlign: "center", backgroundColor: "#E6F4EA", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
            <IonCardContent>
              <IonIcon icon={contractOutline} style={{ fontSize: "2rem", color: "#28A745" }} />
              <IonText style={{ fontSize: "2rem", fontWeight: 600, color: "#28A745" }}>{totalEquipment}</IonText>
              <p style={{ fontWeight: 500, color: "#28A745" }}>Total Equipment</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size="6" sizeMd="3">
          <IonCard style={{ border: "1.5px solid #007BFF", borderRadius: 10, padding: "0.5rem", margin: "0.4rem 0", textAlign: "center", backgroundColor: "#E6F0FA", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
            <IonCardContent>
              <IonIcon icon={calendarOutline} style={{ fontSize: "2rem", color: "#007BFF" }} />
              <IonText style={{ fontSize: "2rem", fontWeight: 600, color: "#007BFF" }}>{todayBookings}</IonText>
              <p style={{ fontWeight: 500, color: "#007BFF" }}>Today’s Bookings</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size="6" sizeMd="3">
          <IonCard style={{ border: "1.5px solid #FFC107", borderRadius: 10, padding: "0.5rem", margin: "0.4rem 0", textAlign: "center", backgroundColor: "#FFF8E1", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
            <IonCardContent>
              <IonIcon icon={cashOutline} style={{ fontSize: "2rem", color: "#FFC107" }} />
              <IonText style={{ fontSize: "2rem", fontWeight: 600, color: "#FFC107" }}>₱{totalRevenue}</IonText>
              <p style={{ fontWeight: 500, color: "#FFC107" }}>Revenue Highlights</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size="6" sizeMd="3">
          <IonCard style={{ border: "1.5px solid #17A2B8", borderRadius: 10, padding: "0.5rem", margin: "0.4rem 0", textAlign: "center", backgroundColor: "#E0F7FA", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
            <IonCardContent>
              <IonIcon icon={peopleOutline} style={{ fontSize: "2rem", color: "#17A2B8" }} />
              <IonText style={{ fontSize: "2rem", fontWeight: 600, color: "#17A2B8" }}>{totalUsers}</IonText>
              <p style={{ fontWeight: 500, color: "#17A2B8" }}>Registered Users</p>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default AdminDashboardCards;
