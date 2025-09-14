import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonText } from "@ionic/react";
import { contractOutline, checkmarkCircleOutline, timeOutline, calendarOutline } from "ionicons/icons";

interface StatsProps {
  totalEquipment: number;
  availableNow: number;
  pendingBookings: number;
  activeRentals: number;
}

const StatsGrid: React.FC<StatsProps> = ({ totalEquipment, availableNow, pendingBookings, activeRentals }) => {
  return (
    <IonGrid className="stats-grid">
      <IonRow>
        <IonCol size="6" sizeMd="3">
          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={contractOutline} className="stat-icon green" />
              <IonText className="stat-number">{totalEquipment}</IonText>
              <p className="stat-label">Total Equipment</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size="6" sizeMd="3">
          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={checkmarkCircleOutline} className="stat-icon green" />
              <IonText className="stat-number">{availableNow}</IonText>
              <p className="stat-label">Available Now</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size="6" sizeMd="3">
          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={timeOutline} className="stat-icon yellow" />
              <IonText className="stat-number">{pendingBookings}</IonText>
              <p className="stat-label">Pending Bookings</p>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size="6" sizeMd="3">
          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={calendarOutline} className="stat-icon gray" />
              <IonText className="stat-number">{activeRentals}</IonText>
              <p className="stat-label">Active Rentals</p>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default StatsGrid;
