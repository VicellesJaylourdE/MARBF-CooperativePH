import React, { useState } from "react";
import { IonModal, IonToast } from "@ionic/react"; 
import { supabase } from "../utils/supabaseClient";
import dayjs from "dayjs";
import "../theme/BookingModal.css"; 
interface BookingSubmitData {
  startDate: string;
  endDate: string;
  location: string;
  quantity: number;
  bookingId: string; 
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: BookingSubmitData) => void; 
  equipmentName: string;
  price: number;
  equipmentId: string;
  maxQuantity: number;
}


const GCASH_ACCOUNT = {
    name: "Jay Lourd", 
    number: "09639539761", 
};

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
  price,
  equipmentId,
  maxQuantity,
}) => {
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "cash">("gcash");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [gcashRefNo, setGcashRefNo] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalDays = startDate && endDate ? dayjs(endDate).diff(dayjs(startDate), 'day') + 1 : 0;
  const totalPrice = totalDays > 0 ? totalDays * price * quantity : 0;

  
  const handleDateChange = (dateType: 'start' | 'end', value: string) => {
    setError(null);
    const dateValue = value || "";
    if (dateType === 'start') {
      setStartDate(dateValue);
    } else {
      setEndDate(dateValue);
    }
    
    const currentStart = dateType === 'start' ? dateValue : startDate;
    const currentEnd = dateType === 'end' ? dateValue : endDate;

    if (currentStart && currentEnd && dayjs(currentStart).isAfter(dayjs(currentEnd))) {
      setError("Start date cannot be after the end date.");
    }
  };

  const handleQuantityChange = (value: string | null | undefined) => {
    setError(null);
    const qty = Number(value) || 0;
    setQuantity(qty);
    if (qty <= 0) setError("Quantity must be greater than zero.");
    if (qty > maxQuantity) setError(`Cannot book ${qty} units. Only ${maxQuantity} available.`);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProofFile(file || null); 
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Validation logic
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
      
      // Upload proof
      if (proofFile) {
        const fileName = `${Date.now()}_${proofFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("payment_proofs")
          .upload(`payment_proofs/${fileName}`, proofFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("payment_proofs").getPublicUrl(`payment_proofs/${fileName}`);
        proofUrl = data.publicUrl;
      }

      // Get user profile and insert booking/transaction logic... (same as before)

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required.");
      
      const { data: profile } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();
      if (!profile) throw new Error("User record not found in 'users' table.");
      const user_id = profile.user_id;

  
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
        .select('id') 
        .single();
        
    if (bookingError) {
        if (bookingError.code === '23P01') {
            throw new Error("CONFLICT: The selected dates are already booked for this specific equipment unit. Please choose different dates.");
        }
        throw bookingError;
    }
    if (!bookingData) throw new Error("Booking insertion failed unexpectedly.");


      await supabase.from("transactions").insert([{
          booking_id: bookingData.id,
          user_id,
          amount: totalPrice,
          status: paymentMethod === 'gcash' ? 'unpaid' : 'pending', 
          payment_method: paymentMethod,
          proof_url: proofUrl,
          gcash_ref_no: paymentMethod === 'gcash' ? gcashRefNo.trim() || null : null, 
          quantity: quantity, 
          price_type: "unit", 
      }]);

      setToastMsg("✅ Booking submitted! Waiting for Admin confirmation.");
      onClose();
     
      onSubmit({ startDate, endDate, location, quantity, bookingId: bookingData.id });
      
    } catch (err: any) {
      console.error("Booking failed:", err);
      setToastMsg(`Booking failed. Error: ${err.message || 'Check console.'}`);
    } finally {
      setUploading(false);
    }
  };
  
  const resetState = () => {
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
      <IonModal isOpen={isOpen} onDidDismiss={() => {onClose(); resetState();}} backdropDismiss={false}>
        <div className="booking-modal"> 
          <div className="booking-card"> 
            
            <div className="booking-header"> 
              <h2>Book {equipmentName}</h2>
              <p>Rate: ₱{price.toLocaleString()} / day | Available: {maxQuantity} units</p>
            </div>

            <form className="booking-form"> 
              


              <div className="form-grid"> 
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    min={dayjs().format('YYYY-MM-DD')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    min={startDate || dayjs().format('YYYY-MM-DD')}
                    required
                  />
                </div>
              </div>

              {error && <p className="error-message" style={{ color: "red", fontWeight: 'bold' }}>{error}</p>} 
              <div className="form-grid"> 
                <div className="form-group">
                  <label>Quantity (Max: {maxQuantity})</label>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group"> 
                  <label>Location</label>
                  <textarea 
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    rows={2}
                    required
                  />
                </div>
              </div>
              
              {totalPrice > 0 && (
                <div className="computation-box">
                  <p><strong>Total Days:</strong> {totalDays}</p>
                  <p><strong>Units:</strong> {quantity} x ₱{price.toLocaleString()}</p>
                  <hr />
                  <h3><strong>GRAND TOTAL:</strong> ₱{totalPrice.toLocaleString()}</h3>
                </div>
              )}
              
              <div className="form-group" style={{marginTop: '20px'}}>
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => { setPaymentMethod(e.target.value as "gcash" | "cash"); setProofFile(null); setGcashRefNo(''); }}
                >
                  <option value="gcash">GCash</option>
                  <option value="cash">Cash (Upon Delivery)</option>
                </select>
              </div>
              
              {paymentMethod === "gcash" && (
                <>
                  <div className="info-card" style={{ backgroundColor: '#e9f7e9' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>GCash Payment Details 📱</p>
                    <p style={{ margin: 0 }}> Account Name: {GCASH_ACCOUNT.name}</p>
                    <p style={{ margin: 0 }}> Account Number: {GCASH_ACCOUNT.number}</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Upload Proof of Payment (REQUIRED)</label>
                    <input type="file" accept="image/*" onChange={handleProofUpload} disabled={uploading} />
                    {proofFile && <p style={{fontSize: '0.8em', color: 'green', margin: '5px 0 0 0'}}>File selected: {proofFile.name}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label>GCash Reference Number (REQUIRED)</label>
                    <input 
                      type="text" 
                      placeholder="Enter reference number" 
                      value={gcashRefNo} 
                      onChange={(e) => setGcashRefNo(e.target.value)} 
                    />
                  </div>
                </>
              )}
              
              {paymentMethod === "cash" && (
                <>
             
                  <div className="info-card" style={{ backgroundColor: '#e6f7ff' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Cash Payment Instruction 💵</p>
                    <p style={{ margin: 0, fontSize: '0.9em' }}>You selected Cash upon Delivery/Pickup. Payment of ₱{totalPrice.toLocaleString()} will be collected by our staff/driver.</p>
                  </div>

                  <div className="form-group">
                    <label>Upload ID/Proof (for Verification)</label>
                    <input type="file" accept="image/*" onChange={handleProofUpload} disabled={uploading} />
                    {proofFile && <p style={{fontSize: '0.8em', color: 'green', margin: '5px 0 0 0'}}>File selected: {proofFile.name}</p>}
                  </div>
                </>
              )}
              
              <div className="form-buttons"> 
                <button
                  type="button"
                  className="btn primary" 
                  onClick={handleSubmit}
                  disabled={uploading || totalPrice <= 0 || !!error}
                  style={{ minWidth: '150px' }} // Added min-width to match old code style better
                >
                  {uploading ? "Processing..." : `Submit Booking (₱${totalPrice.toLocaleString()})`}
                </button>
                <button 
                  type="button" 
                  className="btn outline" 
                  onClick={onClose}
                  style={{ minWidth: '100px' }} // Added min-width
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </IonModal>

      <IonToast 
        isOpen={!!toastMsg} 
        message={toastMsg} 
        duration={3500} 
        onDidDismiss={() => setToastMsg("")} 
      />
    </>
  );
};

export default BookingModal;