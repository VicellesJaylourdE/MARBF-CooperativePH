import { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonInputPasswordToggle, // 👁️ added for show/hide password
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import { useIonRouter } from "@ionic/react";

const VerifyOtp: React.FC = () => {
  const router = useIonRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleVerifyOtpAndReset = async () => {
    if (!otp || !oldPassword || !newPassword) {
      setToastMessage("Please fill in OTP, old password, and new password.");
      setShowToast(true);
      return;
    }

    setLoading(true);

    // 1️⃣ Verify OTP
    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (otpError) {
      setToastMessage("⚠️ OTP Error: " + otpError.message);
      setShowToast(true);
      setLoading(false);
      return;
    }

    // 2️⃣ Verify old password
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (loginError || !loginData.user) {
      setToastMessage("❌ Old password is incorrect.");
      setShowToast(true);
      setLoading(false);
      return;
    }

    // 3️⃣ Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setToastMessage("❌ Failed to update password: " + updateError.message);
    } else {
      setToastMessage("✅ Password successfully updated!");
      setTimeout(() => router.push("/login"), 1500);
    }

    setShowToast(true);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Verify OTP & Reset Password</h2>
        <p>Enter OTP, your old password, and set a new password.</p>

        {/* OTP Input */}
        <IonInput
          type="text"
          placeholder="Enter OTP"
          maxlength={6}
          onIonChange={(e) => setOtp(e.detail.value!)}
        />

        {/* Old Password Input with 👁️ toggle */}
        <IonInput
          type="password"
          placeholder="Enter old password"
          onIonChange={(e) => setOldPassword(e.detail.value!)}
        >
          <IonInputPasswordToggle slot="end" />
        </IonInput>

        {/* New Password Input with 👁️ toggle */}
        <IonInput
          type="password"
          placeholder="Enter new password"
          onIonChange={(e) => setNewPassword(e.detail.value!)}
        >
          <IonInputPasswordToggle slot="end" />
        </IonInput>

        <IonButton
          expand="block"
          onClick={handleVerifyOtpAndReset}
          disabled={loading}
          color="warning"
        >
          {loading ? <IonSpinner name="crescent" /> : "Verify & Reset"}
        </IonButton>

        <IonButton fill="clear" onClick={() => router.push("/forgot-password")}>
          ← Back
        </IonButton>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default VerifyOtp;
