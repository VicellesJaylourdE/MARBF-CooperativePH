import { useEffect, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { calendarOutline, notificationsOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

interface Booking {
  id: string;
  equipment_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

const CalendarView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // 👉 fetch only current user's bookings
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("bookings")
          .select("id, equipment_name, start_date, end_date, status")
          .eq("user_id", user.id) // assuming bookings table has user_id column
          .order("start_date", { ascending: true });

        if (error) throw error;

        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="equipment-section">
      <h2 className="equipment-title">
        <IonIcon icon={calendarOutline} style={{ marginRight: "6px" }} />
        My Calendar
      </h2>
      <p className="equipment-sub">
        View your rental bookings in your device calendar.
      </p>

      <IonCard>
        <IonCardContent>
          <IonIcon icon={notificationsOutline} /> Calendar events are
          automatically added when you book equipment.
        </IonCardContent>
      </IonCard>

      {loading ? (
        <IonSpinner name="dots" />
      ) : bookings.length > 0 ? (
        <IonList>
          {bookings.map((b) => (
            <IonItem key={b.id}>
              <IonLabel>
                <h3>{b.equipment_name}</h3>
                <p>
                  {new Date(b.start_date).toLocaleDateString()} →{" "}
                  {new Date(b.end_date).toLocaleDateString()}
                </p>
                <p>Status: {b.status}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default CalendarView;
