import { useState, useEffect } from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonSearchbar,
  IonSpinner,
  IonImg,
  IonBadge,
} from "@ionic/react";
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

    const channel = supabase
      .channel("equipment-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        (payload) => {
          console.log("Change received!", payload);
          fetchEquipment();
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

  const handleBookingSubmit = async (booking: { startDate: string; endDate: string; notes: string }) => {
    try {
    
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        alert("Please log in to make a booking.");
        return;
      }

      const userEmail = userData.user.email;

      const { data: userRecord, error: userLookupError } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", userEmail)
        .single();

      if (userLookupError || !userRecord) {
        console.error("User lookup failed:", userLookupError);
        alert("Account not found in users table.");
        return;
      }

      const user_id = userRecord.user_id;

     
      const { data: existingBooking, error: dupCheckError } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user_id)
        .eq("equipment_name", selectedEquipment)
        .in("status", ["pending", "approved"]);

      if (dupCheckError) {
        console.error("Error checking duplicate booking:", dupCheckError);
      }

      if (existingBooking && existingBooking.length > 0) {
        alert("⚠️ You already have an active booking for this equipment. Please wait until it’s completed or cancelled.");
        return;
      }

      const { data: newBooking, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user_id,
            equipment_name: selectedEquipment,
            start_date: booking.startDate,
            end_date: booking.endDate,
            notes: booking.notes || "",
            payment_method: "gcash",
            status: "pending",
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          booking_id: newBooking.id,
          user_id: user_id,
          amount: selectedPrice,
          status: "unpaid",
          payment_method: "gcash",
          proof_url: null,
        },
      ]);

      if (transactionError) throw transactionError;

      alert(`✅ Booking created for ${selectedEquipment}. Transaction pending payment.`);
      setIsBookingOpen(false);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error creating booking or transaction.");
    }
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
      <h2 className="equipment-title">Available Equipment</h2>
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
                <IonCol size="6" sizeMd="3" key={eq.id}>
                  <IonCard
                    className="equipment-card"
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#f9f9f9",
                        height: "100px",
                        overflow: "hidden",
                      }}
                    >
                      <IonImg
                        src={eq.image_url || "https://via.placeholder.com/100?text=No+Image"}
                        alt={eq.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>

                    <IonCardContent style={{ textAlign: "center", padding: "8px" }}>
                      <h3 style={{ fontSize: "1rem", margin: "6px 0" }}>{eq.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "#666" }}>{eq.category}</p>
                      <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                        <strong>₱{eq.price}</strong> / day
                      </p>

                      <IonBadge
                        color={getStatusColor(eq)}
                        style={{ marginBottom: "6px", fontSize: "0.7rem" }}
                      >
                        {getStatusText(eq)}
                      </IonBadge>

                      <IonButton
                        expand="block"
                        size="small"
                        color={getStatusColor(eq)}
                        disabled={!(eq.status === "available" || eq.available)}
                        onClick={() => openBooking(eq.name, eq.price)}
                        style={{ marginTop: "6px" }}
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
