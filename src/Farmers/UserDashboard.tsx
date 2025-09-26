import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../utils/supabaseClient";
import HeaderBar from "../components/Farmer_HeaderBar";
import StatsGrid from "../components/Farmer_StatsGrid";
import EquipmentCatalog from "../components/Farmer_EquipmentCatalog";
import CalendarView from "../components/Farmer_CalendarView";
import "../theme/UserDashboard.css";

const UserDashboard: React.FC = () => {
  const [segment, setSegment] = useState("catalog");
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableNow: 0,
    pendingBookings: 0,
    activeRentals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token: " + token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error: ", error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      alert(`New Notification: ${notification.title}\n${notification.body}`);
    });
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { count: totalEquipment } = (await supabase
          .from("equipment")
          .select("*", { count: "exact", head: true })) as { count: number | null };

        const { count: availableNow } = (await supabase
          .from("equipment")
          .select("*", { count: "exact", head: true })
          .eq("status", "available")) as { count: number | null };

        const { count: pendingBookings } = (await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")) as { count: number | null };

        const { count: activeRentals } = (await supabase
          .from("rentals")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")) as { count: number | null };

        setStats({
          totalEquipment: totalEquipment ?? 0,
          availableNow: availableNow ?? 0,
          pendingBookings: pendingBookings ?? 0,
          activeRentals: activeRentals ?? 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <IonPage>
      <HeaderBar />
      <IonContent fullscreen>
        {loading ? (
          <IonSpinner name="dots" />
        ) : (
          <StatsGrid
            totalEquipment={stats.totalEquipment}
            availableNow={stats.availableNow}
            pendingBookings={stats.pendingBookings}
            activeRentals={stats.activeRentals}
          />
        )}
        
        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(String(e.detail.value))}
        >
          <IonSegmentButton value="catalog">
            <IonLabel>Equipment Catalog</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="bookings">
            <IonLabel>My Bookings</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="calendar">
            <IonLabel>Calendar</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {segment === "catalog" && <EquipmentCatalog />}
        {segment === "bookings" && (
          <p className="ion-padding">📖 Your bookings will appear here.</p>
        )}
        {segment === "calendar" && <CalendarView />}
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;
