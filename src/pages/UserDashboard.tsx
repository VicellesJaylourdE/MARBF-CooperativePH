import { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
} from "@ionic/react";
import {
  logOutOutline,
  personCircleOutline,
  settingsOutline,
  contractOutline,
  checkmarkCircleOutline,
  timeOutline,
  calendarOutline,
  cogOutline,
  notificationsOutline,
} from "ionicons/icons";
import { PushNotifications } from "@capacitor/push-notifications";
import { Calendar } from "@ionic-native/calendar";
import { supabase } from '../utils/supabaseClient'; 
import "../theme/UserDashboard.css";

const UserDashboard: React.FC = () => {
  const [segment, setSegment] = useState("catalog");
  const [searchText, setSearchText] = useState("");

 
  const [totalEquipment, setTotalEquipment] = useState(6);
  const [availableNow, setAvailableNow] = useState(6);
  const [pendingBookings, setPendingBookings] = useState(3);
  const [activeRentals, setActiveRentals] = useState(0);

 
  const [equipment, setEquipment] = useState([
    { id: 1, name: "Tractor A", category: "Tractor", available: true },
    { id: 2, name: "Harvester B", category: "Harvester", available: true },
    { id: 3, name: "Plow C", category: "Plow", available: true },
  ]);

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

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        alert(`New Notification: ${notification.title}\n${notification.body}`);
      }
    );
  }, []);

 
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      window.location.href = "/"; 
    }
  };

 
  const handleBooking = (eqName: string) => {
    alert(`Booked ${eqName}!`);

   
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    Calendar.createEvent(
      `Rental: ${eqName}`,
      "Farm Coop",
      "Equipment rental booking",
      startDate,
      endDate
    )
      .then(() => {
        console.log("Event created in calendar");
      })
      .catch((err) => console.error("Calendar error: ", err));
  };

  return (
    <IonPage>
  
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle className="logo">
            <IonIcon icon={contractOutline} style={{ marginRight: "8px" }} />
            Coop PaBOOKid
          </IonTitle>
          <IonButtons slot="end">
            <IonButton>Jay</IonButton>
            <IonButton>
              <IonIcon icon={settingsOutline} />
            </IonButton>
            <IonButton>
              <IonIcon icon={personCircleOutline} />
            </IonButton>
            <IonButton color="warning" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

   
      <IonContent fullscreen>
      
        <div className="hero-section">
          <div className="hero-overlay">
            <h1 className="welcome-text">Welcome to Coop PaBOOKid</h1>
            <p className="sub-text">
              Mantibugao Agrarian Reform Beneficiaries Farmers Cooperative
            </p>
            <p className="desc-text">
              Manage and book agricultural equipment rentals with our modern
              digital platform. Streamline your farming operations with easy
              access to tractors, harvesters, and more.
            </p>
          </div>
        </div>

     
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
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    className="stat-icon green"
                  />
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

   
        {segment === "catalog" && (
          <div className="equipment-section">
            <h2 className="equipment-title">
              <IonIcon icon={contractOutline} style={{ marginRight: "6px" }} />
              Available Equipment
            </h2>
            <p className="equipment-sub">
              Browse and book agricultural equipment for your farming needs
            </p>

           
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              placeholder="Search equipment by name, category, or description..."
            />

      
            <IonGrid>
              <IonRow>
                {equipment
                  .filter(
                    (eq) =>
                      eq.name.toLowerCase().includes(searchText.toLowerCase()) ||
                      eq.category
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                  )
                  .map((eq) => (
                    <IonCol size="6" sizeMd="4" key={eq.id}>
                      <IonCard className="equipment-card">
                        <IonCardContent>
                          <IonIcon icon={cogOutline} className="equip-icon" />
                          <h3>{eq.name}</h3>
                          <p>{eq.category}</p>
                          <IonButton
                            expand="block"
                            size="small"
                            color="success"
                            onClick={() => handleBooking(eq.name)}
                          >
                            Book Now
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

      
        {segment === "bookings" && (
          <div className="equipment-section">
            <h2 className="equipment-title">My Bookings</h2>
            <p className="equipment-sub">View and manage your bookings here.</p>
          </div>
        )}

     
        {segment === "calendar" && (
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
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;
