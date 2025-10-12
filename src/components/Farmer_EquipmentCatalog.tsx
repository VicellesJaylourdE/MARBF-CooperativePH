import { useState, useEffect } from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonSpinner,
  IonImg,
  IonBadge,
} from "@ionic/react";
import { contractOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import BookingModal from "./Farmer_BookingModal";

interface Equipment {
  id: string | number;
  name: string;
  category: string;
  price: number;
  status?: string;
  available?: boolean;
  image_url?: string;
}

const EquipmentCatalog: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("id, name, category, status, price, image_url");

    if (error) {
      console.error("Error fetching equipment:", error);
      setEquipment([]);
    } else {
      setEquipment(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();

    // 📡 Realtime subscription
    const channel = supabase
      .channel("equipment-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        (payload) => {
          console.log("Change received!", payload);
          fetchEquipment(); // refresh list when admin updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openBooking = (eqName: string, eqPrice: number) => {
    setSelectedEquipment(eqName);
    setSelectedPrice(eqPrice);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = (booking: { startDate: string; endDate: string; notes: string }) => {
    console.log("Booking submitted:", booking);
    alert(`Booking confirmed for ${selectedEquipment} from ${booking.startDate} to ${booking.endDate}`);
  };

  const getStatusColor = (eq: Equipment) => {
    if (eq.status === "available" || eq.available) return "success";
    if (eq.status === "maintenance") return "warning";
    return "medium";
  };

  const getStatusText = (eq: Equipment) => {
    if (eq.status === "available" || eq.available) return "Available";
    if (eq.status === "maintenance") return "Maintenance";
    return "Non-available";
  };

  return (
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

      {loading ? (
        <IonSpinner name="dots" />
      ) : (
        <IonGrid>
          <IonRow>
            {equipment
              .filter(
                (eq) =>
                  eq.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  eq.category.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((eq) => (
                <IonCol size="6" sizeMd="4" key={eq.id}>
                  <IonCard className="equipment-card">
                    <IonImg
                      src={eq.image_url || "https://via.placeholder.com/150x100?text=No+Image"}
                      alt={eq.name}
                    />
                    <IonCardContent>
                      <h3>{eq.name}</h3>
                      <p>{eq.category}</p>
                      <p>
                        <strong>₱{eq.price}</strong> / day
                      </p>

                      <IonBadge color={getStatusColor(eq)} style={{ marginBottom: "6px" }}>
                        {getStatusText(eq)}
                      </IonBadge>

                      <IonButton
                        expand="block"
                        size="small"
                        color={getStatusColor(eq)}
                        disabled={!(eq.status === "available" || eq.available)}
                        onClick={() => openBooking(eq.name, eq.price)}
                      >
                        {eq.status === "available" || eq.available ? "Book Now" : "Unavailable"}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
          </IonRow>
        </IonGrid>
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSubmit={handleBookingSubmit}
        equipmentName={selectedEquipment || ""}
        price={selectedPrice}
      />
    </div>
  );
};

export default EquipmentCatalog;