import React, { useState } from "react";
import { IonModal, IonToast, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonItem, IonLabel } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import dayjs from "dayjs";

// UPDATED: Gi-apil ang bookingId
interface BookingSubmitData {
  startDate: string;
  endDate: string;
  location: string;
  quantity: number;
  bookingId: string; // Kinahanglanon para sa Inventory Log sa parent
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: BookingSubmitData) => void; // UPDATED interface
  equipmentName: string;
  price: number;
  equipmentId: string;
  maxQuantity: number;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
  price,
  equipmentId,
  maxQuantity,
}) => {
  // State for Form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "cash">("gcash");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [gcashRefNo, setGcashRefNo] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // State for UI/Feedback
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalDays = startDate && endDate ? dayjs(endDate).diff(dayjs(startDate), 'day') + 1 : 0;
  const totalPrice = totalDays > 0 ? totalDays * price * quantity : 0;

  
  const handleDateChange = (dateType: 'start' | 'end', value: string) => {
    setError(null);
    if (dateType === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    
    const currentStart = dateType === 'start' ? value : startDate;
    const currentEnd = dateType === 'end' ? value : endDate;

    if (currentStart && currentEnd && dayjs(currentStart).isAfter(dayjs(currentEnd))) {
      setError("Start date cannot be after the end date.");
    }
  };

  const handleQuantityChange = (value: string) => {
    setError(null);
    const qty = Number(value);
    setQuantity(qty);
    if (qty <= 0) setError("Quantity must be greater than zero.");
    if (qty > maxQuantity) setError(`Cannot book ${qty} units. Only ${maxQuantity} available.`);
  };

     
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProofFile(file);
  };

                      
  const handleSubmit = async () => {
    setError(null);
    if (!startDate || !endDate || totalDays <= 0 || !location.trim() || quantity <= 0) {
      setError("Please fill all fields and ensure valid dates/quantity.");
      return;
    }
    if (quantity > maxQuantity) {
      setError(`Cannot book ${quantity} units. Only ${maxQuantity} available.`);
      return;
    }
    if (paymentMethod === "gcash" && !proofFile) {
      setError("Upload proof of GCash payment.");
      return;
    }
    if (paymentMethod === "gcash" && !gcashRefNo.trim()) {
      setError("Enter GCash reference number.");
      return;
    }
    
    setUploading(true);
    let proofUrl = null;

    try {
      // 1. Upload Proof (if GCash)
      if (proofFile) {
        const fileName = `${Date.now()}_${proofFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("payment_proofs")
          .upload(`payment_proofs/${fileName}`, proofFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("payment_proofs").getPublicUrl(`payment_proofs/${fileName}`);
        proofUrl = data.publicUrl;
      }

      // 2. Get User ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required.");
      
      const { data: profile } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();
      if (!profile) throw new Error("User record not found in 'users' table.");
      const user_id = profile.user_id;

    // 3. Insert Booking (Daghan og data ang gi-select, apil ang ID)
    const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
       .insert([{
            user_id,
            equipment_id: equipmentId,
            equipment_name: equipmentName,
            start_date: startDate,
            end_date: endDate,
            location,
            status: "pending",
            total_price: totalPrice,
            quantity,      
            payment_method: paymentMethod,
        }])
        .select('id') // Important: Select the ID
        .single();
        if (bookingError || !bookingData) throw bookingError;


      // 4. Insert Transaction
        await supabase.from("transactions").insert([{
            booking_id: bookingData.id,
            user_id,
            amount: totalPrice,
            status: "unpaid",
            payment_method: paymentMethod,
            proof_url: proofUrl,
            gcash_ref_no: gcashRefNo.trim() || null, 
            quantity: quantity, 
            price_type: "unit", 
        }]);

      setToastMsg("✅ Booking submitted! Waiting for Admin confirmation.");
      onClose();
      // 5. Trigger Stock Deduction in Parent, passing the new Booking ID
      onSubmit({ startDate, endDate, location, quantity, bookingId: bookingData.id });
      
    } catch (err: any) {
      console.error("Booking failed:", err);
      setToastMsg(`Booking failed. Error: ${err.message || 'Check console.'}`);
    } finally {
      setUploading(false);
    }
  };
  
  const resetState = () => {
    // ... (reset state remains the same)
    setStartDate("");
    setEndDate("");
    setLocation("");
    setQuantity(1);
    setProofFile(null);
    setGcashRefNo("");
    setError(null);
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={() => {onClose(); resetState();}}>
        {/* ... (Modal Content remains the same) ... */}
        <IonHeader>
          <IonToolbar>
            <IonTitle>Book {equipmentName}</IonTitle>
            <IonButton slot="end" onClick={onClose}>Close</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          
          <h3 style={{marginTop: 0}}>Rate: ₱{price.toLocaleString()} / day | **Available: {maxQuantity} units**</h3>
          
            <IonItem>
            <IonLabel position="stacked">Quantity (Max: {maxQuantity})</IonLabel>
            <IonInput
              type="number"
              value={quantity}
              onIonChange={(e) => handleQuantityChange(e.detail.value!)}
              min="1"
              max={maxQuantity}
            />
          </IonItem>
 
          <IonItem>
            <IonLabel position="stacked">Start Date</IonLabel>
            <IonInput type="date" value={startDate} onIonChange={(e) => handleDateChange('start', e.detail.value!)} min={dayjs().format('YYYY-MM-DD')} />
          </IonItem>
 
          <IonItem>
            <IonLabel position="stacked">End Date</IonLabel>
            <IonInput type="date" value={endDate} onIonChange={(e) => handleDateChange('end', e.detail.value!)} min={startDate || dayjs().format('YYYY-MM-DD')} />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Delivery/Pickup Location</IonLabel>
            <IonTextarea value={location} onIonChange={(e) => setLocation(e.detail.value!)} rows={2} />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Payment Method</IonLabel>
            <IonSelect value={paymentMethod} onIonChange={(e) => setPaymentMethod(e.detail.value)}>
              <IonSelectOption value="gcash">GCash</IonSelectOption>
              <IonSelectOption value="cash">Cash (Upon Delivery)</IonSelectOption>
            </IonSelect>
          </IonItem>

          {paymentMethod === "gcash" && (
            <>
              <IonItem>
                <IonLabel position="stacked">Upload Proof of Payment (GCash)</IonLabel>
                <input type="file" accept="image/*" onChange={handleProofUpload} disabled={uploading} />
                {proofFile && <p style={{fontSize: '0.8em', color: 'green'}}>File selected: {proofFile.name}</p>}
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">GCash Reference Number (TEXT)</IonLabel>
                <IonInput type="text" placeholder="e.g. 123456789012" value={gcashRefNo} onIonChange={(e) => setGcashRefNo(e.detail.value!)} />
              </IonItem>
            </>
          )}
          
          {error && <p style={{ color: "red", fontWeight: 'bold' }}>{error}</p>}
          
          <div style={{ padding: '15px', marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <p>Total Days: **{totalDays}**</p>
              <p>Units: **{quantity}** x ₱{price.toLocaleString()}</p>
              <h3 style={{ borderTop: '1px solid #ddd', paddingTop: '10px', color: '#2e7d32' }}>GRAND TOTAL: ₱{totalPrice.toLocaleString()}</h3>
          </div>

          <IonButton 
              expand="block" 
              color="success" 
              onClick={handleSubmit} 
              disabled={uploading || totalPrice <= 0 || !!error}
              style={{marginTop: '20px'}}
            >
            {uploading ? "Processing..." : `Confirm Booking (₱${totalPrice.toLocaleString()})`}
          </IonButton>
        </IonContent>
      </IonModal>

      <IonToast isOpen={!!toastMsg} message={toastMsg} duration={3500} onDidDismiss={() => setToastMsg("")} />
    </>
  );
};

export default BookingModal;