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
    IonToast
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import BookingModal from "../components/Farmer_BookingModal";

interface Equipment {
    id: string;
    name: string;
    category: string;
    price: number;
    status: "available" | "maintenance" | "unavailable";
    quantity: number;
    image_url?: string;
}

interface BookingSubmitData {
    startDate: string;
    endDate: string;
    location: string;
    quantity: number; 
    bookingId: string; 
}

const EquipmentCatalog: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const fetchEquipment = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("equipment")
            .select("*")
            .order("name", { ascending: true });

        if (!error) setEquipment(data || []);
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


    
    const handleBookingSubmit = async (booking: BookingSubmitData) => {
        if (!selectedEquipment) return;
      
        
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("users").select("user_id").eq("user_email", user?.email).single();
        const user_id = profile?.user_id;
        
        try {
            
            const { data: currentEqData, error: fetchError } = await supabase
                .from("equipment")
                .select("quantity")
                .eq("id", selectedEquipment.id)
                .single();

            if (fetchError || !currentEqData) throw new Error("Could not fetch current stock.");

            const finalNewQuantity = currentEqData.quantity - booking.quantity;
            
            if (finalNewQuantity < 0) {
                 
                 throw new Error("Insufficient stock (Realtime conflict detected).");
            }
            
            const { error: updateError } = await supabase
                .from("equipment")
                .update({ quantity: finalNewQuantity })
                .eq("id", selectedEquipment.id)
                .select()
                .single();
            
            if (updateError) throw updateError;
            
        
            if (user_id) {
                await supabase.from("inventory_logs").insert([
                    {
                        equipment_id: selectedEquipment.id,
                        user_id: user_id, 
                        reference_booking: booking.bookingId, 
                        action: "reserve",
                        quantity_change: -booking.quantity,
                    },
                ]);
            }
            
            setToastMsg(`✅ Booking success (Pending Admin Approval). ${booking.quantity} units reserved.`);
            
        } catch (err: any) {
            console.error("Stock update/logging error:", err);
           
            setToastMsg(`⚠️ Stock Error: Booking inserted but stock update failed: ${err.message}. Admin intervention needed.`);
        }
    };

    const getStatusColor = (eq: Equipment) => (eq.status === "available" && eq.quantity > 0 ? "success" : "medium");
    const getStatusText = (eq: Equipment) => (eq.status === "available" && eq.quantity > 0 ? "Available" : "Unavailable");

    return (
        <div className="equipment-section">
            <h2 className="equipment-title">Available Equipment</h2>

            
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
                                        <IonCard className="equipment-card">
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
                                                    <p style={{ fontSize: "1rem", color: "#2e7d32", fontWeight: "bold", marginTop: "6px", marginBottom: "0" }}>
                                                        ₱{eq.price.toLocaleString()} <span style={{ color: "#888", fontSize: "0.85rem", fontWeight: "normal" }}>/day</span>
                                                </p>

                                            <p style={{ fontSize: "0.85rem", color: eq.quantity > 0 ? '#007bff' : 'red', fontWeight: "500", marginTop: "4px", marginBottom: "8px" }}>
                                                {eq.quantity} units
                                                </p> 
                                            <div style={{ textAlign: "left" }}>
                                                <IonButton
                                            size="small"
                                            color={getStatusColor(eq)}
                                                disabled={!(eq.status === "available" && eq.quantity > 0)}
                                            onClick={() => openBooking(eq)}
                                                style={{ marginTop: "8px", borderRadius: "8px", fontWeight: 600, width: "auto" }}
                                        >
                                                    {eq.status === "available" && eq.quantity > 0 ? "Book Now" : "Unavailable"}
                                                </IonButton>
                                            </div>
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
                    maxQuantity={selectedEquipment.quantity} 
                />
                    )}
                <IonToast isOpen={!!toastMsg} message={toastMsg} duration={3500} onDidDismiss={() => setToastMsg("")} />
            </div>
        );
    };

export default EquipmentCatalog;