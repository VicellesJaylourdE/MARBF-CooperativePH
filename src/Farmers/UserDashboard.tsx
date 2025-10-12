import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../utils/supabaseClient";
import HeaderBar from "../components/Farmer_HeaderBar";
import EquipmentCatalog from "../components/Farmer_EquipmentCatalog";
import CalendarView from "../components/Farmer_CalendarView";
import "../theme/UserDashboard.css";

const UserDashboard: React.FC = () => {
  const [segment, setSegment] = useState("catalog");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setToastMsg("Please log in to view your bookings.");
        setBookings([]);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (err: any) {
      console.error("Error loading bookings:", err.message);
      setToastMsg("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (segment === "bookings") {
      fetchBookings();
    }
  }, [segment]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          fetchBookings();
        }
        if (event === "SIGNED_OUT") {
          setBookings([]);
        }
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token:", token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        alert(`📢 New Notification: ${notification.title}\n${notification.body}`);
      }
    );
  }, []);

  return (
    <IonPage>
      <HeaderBar />
      <IonContent fullscreen>
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
          <>
            {loading ? (
              <div className="ion-text-center ion-padding">
                <IonSpinner name="crescent" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="ion-text-center ion-padding">
                📖 No bookings found yet.
              </p>
            ) : (
              <IonList>
                {bookings.map((b) => (
                  <IonCard key={b.id}>
                    <IonCardHeader>
                      <IonCardTitle>{b.equipment_name}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonItem>
                        <IonLabel>
                          <strong>Start:</strong> {b.start_date}
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <strong>End:</strong> {b.end_date}
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <strong>Location:</strong> {b.location || "N/A"}
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <strong>Total:</strong> ₱{b.total_price || 0}
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <strong>Status:</strong>{" "}
                          <span
                            style={{
                              color:
                                b.status === "approved"
                                  ? "green"
                                  : b.status === "declined"
                                  ? "red"
                                  : b.status === "pending"
                                  ? "orange"
                                  : "gray",
                              fontWeight: "bold",
                            }}
                          >
                            {b.status.toUpperCase()}
                          </span>
                        </IonLabel>
                      </IonItem>
                      {b.notes && (
                        <IonItem>
                          <IonLabel>
                            <strong>Notes:</strong> {b.notes}
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            )}
          </>
        )}

        {/* Calendar View */}
        {segment === "calendar" && <CalendarView />}

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;
