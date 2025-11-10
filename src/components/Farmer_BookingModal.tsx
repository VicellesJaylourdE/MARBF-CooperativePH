import React, { useState } from "react";
import { IonModal, IonToast } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import "../theme/BookingModal.css";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: {
    startDate: string;
    endDate: string;
    location: string;
    quantity: number;
    unit: "unit";
  }) => void;
  equipmentName: string;
  price: number;
  equipmentId?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
  price,
  equipmentId,
}) => {
  const priceType: "unit" = "unit";
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "cash">("gcash");
  const [proofUrl, setProofUrl] = useState("");
  const [gcashRefNo, setGcashRefNo] = useState("");
  const [days, setDays] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const computeTotal = (d: number, q: number) => setTotalPrice(d * price * q);

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate) handleEndDateChange(endDate);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (!startDate || !value) return;
    const start = new Date(startDate);
    const end = new Date(value);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diff > 0) {
      setDays(diff);
      computeTotal(diff, quantity);
    } else {
      setDays(0);
      setTotalPrice(0);
      setToastMsg("⚠️ End date must be after start date.");
    }
  };

  const handleQuantityChange = (value: string) => {
    const qty = Number(value) || 0;
    setQuantity(qty);
    computeTotal(days, qty);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(`payment_proofs/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("payment_proofs").getPublicUrl(`payment_proofs/${fileName}`);
      setProofUrl(data.publicUrl);
      setToastMsg(`Uploaded: ${file.name}`);
    } catch {
      setToastMsg("Failed to upload proof.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || days <= 0) return alert("Select valid dates.");
    if (!location.trim()) return alert("Enter location.");
    if (paymentMethod === "gcash") {
      if (!proofUrl) return alert("Upload proof of payment.");
      if (!gcashRefNo.trim() || isNaN(Number(gcashRefNo))) return alert("Enter valid GCash reference number.");
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Login required.");

      const { data: profile } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();
      if (!profile) return alert("User record not found.");

      // Insert booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([{
          user_id: profile.user_id,
          equipment_id: equipmentId,
          equipment_name: equipmentName,
          start_date: startDate,
          end_date: endDate,
          location,
          status: "pending",
          total_price: totalPrice,
          quantity,
          unit: "unit",
          payment_method: paymentMethod,
        }])
        .select()
        .single();
      if (bookingError || !bookingData) throw bookingError;

      // Insert transaction if GCash or Cash
      await supabase.from("transactions").insert([{
        booking_id: bookingData.id,
        user_id: profile.user_id,
        amount: totalPrice,
        status: "unpaid",
        payment_method: paymentMethod,
        proof_url: proofUrl || null,
        gcash_ref_no: Number(gcashRefNo) || null,
      }]);

      // Log inventory action
      await supabase.from("inventory_logs").insert([{
        equipment_id: equipmentId,
        user_id: profile.user_id,
        reference_booking: bookingData.id,
        action: "reserve",
        quantity_change: -quantity,
        created_at: new Date().toISOString(),
      }]);

      onSubmit({ startDate, endDate, location, quantity, unit: "unit" });
      setToastMsg("✅ Booking submitted!");
      onClose();
    } catch (err: any) {
      console.error(err);
      setToastMsg("Booking failed.");
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} backdropDismiss={false}>
        <div className="booking-modal">
          <div className="booking-card">
            <div className="booking-header">
              <h2>Book Equipment</h2>
              <p>Reserve “{equipmentName}” and confirm your details below.</p>
            </div>

            <form className="booking-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Units (Quantity)</label>
                  <input type="number" min="1" value={quantity} onChange={(e) => handleQuantityChange(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
              </div>

              {days > 0 && quantity > 0 && (
                <div className="computation-box">
                  <p><strong>Days:</strong> {days}</p>
                  <p><strong>Price per unit:</strong> ₱{price}</p>
                  <p><strong>Quantity:</strong> {quantity}</p>
                  <hr />
                  <h3><strong>Total:</strong> ₱{totalPrice}</h3>
                </div>
              )}

              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "gcash" | "cash")}>
                  <option value="gcash">GCash</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {(paymentMethod === "gcash" || paymentMethod === "cash") && (
                <>
                  <div className="form-group">
                    <label>Upload Proof of Payment</label>
                    <input type="file" accept="image/*" onChange={handleProofUpload} disabled={uploading} />
                  </div>
                  {paymentMethod === "gcash" && (
                    <div className="form-group">
                      <label>GCash Reference Number</label>
                      <input type="text" placeholder="Enter reference number" value={gcashRefNo} onChange={(e) => setGcashRefNo(e.target.value)} />
                    </div>
                  )}
                </>
              )}

              <div className="form-buttons">
                <button type="button" className="btn primary" onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit Booking"}
                </button>
                <button type="button" className="btn outline" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </IonModal>

      <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2500} onDidDismiss={() => setToastMsg("")} />
    </>
  );
};

export default BookingModal;
