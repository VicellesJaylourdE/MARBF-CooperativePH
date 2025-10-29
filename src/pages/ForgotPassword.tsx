import { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import { useIonRouter } from "@ionic/react";

const ForgotPassword: React.FC = () => {
  const router = useIonRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSendOtp = async () => {
    if (!email) {
      setToastMessage("Please enter your email address.");
      setShowToast(true);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    setLoading(false);

    if (error) {
      setToastMessage("⚠️ " + error.message);
    } else {
      setToastMessage("📩 OTP sent to your email!");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a 6-digit OTP.</p>

        <IonInput
          type="email"
          placeholder="Enter your email"
          onIonChange={(e) => setEmail(e.detail.value!)}
        />

        <IonButton
          expand="block"
          onClick={handleSendOtp}
          disabled={loading}
          color="warning"
        >
          {loading ? <IonSpinner name="crescent" /> : "Send OTP"}
        </IonButton>

        <IonButton fill="clear" onClick={() => router.push("/login")}>
          ← Back to Login
        </IonButton>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="medium"
        />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
