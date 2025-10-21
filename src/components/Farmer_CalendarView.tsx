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
        // ✅ Get current authenticated user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setBookings([]);
          return;
        }

        // ✅ Match the correct user_id from users table
        const { data: userData, error: userTableError } = await supabase
          .from("users")
          .select("user_id")
          .eq("user_email", user.email)
          .single();

        if (userTableError || !userData) {
          console.error("No matching user record found.");
          setBookings([]);
          return;
        }

        // ✅ Fetch bookings using integer user_id (not user.id)
        const { data, error } = await supabase
          .from("bookings")
          .select("id, equipment_name, start_date, end_date, status")
          .eq("user_id", userData.user_id)
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
        <div className="ion-text-center ion-padding">
          <IonSpinner name="dots" />
        </div>
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
                <p>
                  Status:{" "}
                  <span
                    style={{
                      color:
                        b.status === "approved"
                          ? "green"
                          : b.status === "pending"
                          ? "orange"
                          : b.status === "declined"
                          ? "red"
                          : "gray",
                      fontWeight: "bold",
                    }}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <p className="ion-text-center ion-padding">No bookings found.</p>
      )}
    </div>
  );
};

export default CalendarView;
