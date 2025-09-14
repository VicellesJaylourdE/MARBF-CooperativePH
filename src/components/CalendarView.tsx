import { IonCard, IonCardContent, IonIcon } from "@ionic/react";
import { calendarOutline, notificationsOutline } from "ionicons/icons";

const CalendarView: React.FC = () => {
  return (
    <div className="equipment-section">
      <h2 className="equipment-title">
        <IonIcon icon={calendarOutline} style={{ marginRight: "6px" }} />
        My Calendar
      </h2>
      <p className="equipment-sub">View your rental bookings in your device calendar.</p>
      <IonCard>
        <IonCardContent>
          <IonIcon icon={notificationsOutline} /> Calendar events are automatically added when you book equipment.
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default CalendarView;
