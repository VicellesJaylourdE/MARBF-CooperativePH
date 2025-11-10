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
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "maintenance" | "unavailable";
  quantity: number;
  image_url?: string;
}

const EquipmentCatalog: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Fetch equipment from Supabase
  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("*");

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
        () => fetchEquipment()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openBooking = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = async (booking: {
    startDate: string;
    endDate: string;
    location: string;
    quantity: number;
  }) => {
    if (!selectedEquipment) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        alert("Please log in to make a booking.");
        return;
      }

      const userEmail = userData.user.email;
      const { data: userRecord } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", userEmail)
        .single();

      if (!userRecord) {
        alert("Account not found in users table.");
        return;
      }

      const user_id = userRecord.user_id;

      // Check for overlapping bookings
      const { data: overlapping } = await supabase
        .from("bookings")
        .select("*")
        .eq("equipment_id", selectedEquipment.id)
        .or(
          `and(start_date.lte.${booking.endDate},end_date.gte.${booking.startDate})`
        );

      if (overlapping && overlapping.length > 0) {
        alert("⚠️ This equipment is already booked for the selected dates.");
        return;
      }

      // Insert booking
      const { data: newBooking, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id,
            equipment_id: selectedEquipment.id,
            equipment_name: selectedEquipment.name,
            start_date: booking.startDate,
            end_date: booking.endDate,
            location: booking.location,
            quantity: booking.quantity,
            payment_method: "gcash",
            status: "pending",
            total_price: booking.quantity * selectedEquipment.price,
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Insert transaction
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          booking_id: newBooking.id,
          user_id,
          amount: booking.quantity * selectedEquipment.price,
          status: "unpaid",
          payment_method: "gcash",
          proof_url: null,
        },
      ]);

      if (transactionError) throw transactionError;

      alert(`✅ Booking created for ${selectedEquipment.name}. Transaction pending payment.`);
      setIsBookingOpen(false);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error creating booking or transaction.");
    }
  };

  const getStatusColor = (eq: Equipment) => {
    if (eq.status === "available" && eq.quantity > 0) return "success";
    if (eq.status === "maintenance") return "warning";
    return "medium";
  };

  const getStatusText = (eq: Equipment) => {
    if (eq.status === "available" && eq.quantity > 0) return "Available";
    if (eq.status === "maintenance") return "Maintenance";
    return "Non-available";
  };

  return (
    <div className="equipment-section">
      <h2 className="equipment-title">Available Equipment</h2>
      <p className="equipment-sub">Browse and book agricultural equipment for your farming needs</p>

      <IonSearchbar
        value={searchText}
        onIonInput={(e) => setSearchText(e.detail.value!)}
        placeholder="Search equipment by name or category..."
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
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                      backgroundColor: "#fff",
                      transition: "transform 0.2s ease",
                    }}
                    className="equipment-card"
                  >
                    <IonImg
                      src={eq.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={eq.name}
                      style={{ width: "100%", height: "140px", objectFit: "cover" }}
                    />
                    <IonCardContent style={{ padding: "10px 12px", textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: "1rem", margin: 0, fontWeight: 600 }}>{eq.name}</h3>
                        <IonBadge color={getStatusColor(eq)} style={{ fontSize: "0.7rem" }}>
                          {getStatusText(eq)}
                        </IonBadge>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>🌾</span>
                        <span>{eq.category}</span>
                      </p>
                      <p style={{ fontSize: "1rem", color: "#2e7d32", fontWeight: "bold", marginTop: "6px", marginBottom: "0" }}>
                        ₱{eq.price.toLocaleString()} <span style={{ color: "#888", fontSize: "0.85rem", fontWeight: "normal" }}>/day</span>
                      </p>
                      <IonButton
                        expand="block"
                        size="small"
                        color={getStatusColor(eq)}
                        disabled={!(eq.status === "available" && eq.quantity > 0)}
                        onClick={() => openBooking(eq)}
                        style={{ marginTop: "8px", borderRadius: "8px", fontWeight: 600 }}
                      >
                        {eq.status === "available" && eq.quantity > 0 ? "Book Now" : "Unavailable"}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
          </IonRow>
        </IonGrid>
      )}

      {selectedEquipment && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onSubmit={handleBookingSubmit}
          equipmentName={selectedEquipment.name}
          price={selectedEquipment.price}
          equipmentId={selectedEquipment.id}
        />
      )}
    </div>
  );
};

export default EquipmentCatalog;
