import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonAlert,
  IonModal,
  useIonRouter,
  IonSpinner,
  IonToast
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";
import logo from "../assets/logo.png";

const Registerphone: React.FC = () => {
  const navigation = useIonRouter();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const sendOtpPhone = async () => {
    if (!phoneNumber) {
      setAlertMessage("⚠️ Please enter your phone number.");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
    setLoading(false);

    if (error) {
      setAlertMessage("⚠️ Failed to send OTP: " + error.message);
      setShowAlert(true);
      return;
    }

    setOtpSent(true);
    setAlertMessage("📩 OTP sent to " + phoneNumber + ". Please check your SMS.");
    setShowAlert(true);
  };

  const verifyOtpPhone = async () => {
    if (!otp) {
      setAlertMessage("⚠️ Please enter the OTP.");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: otp, type: "sms" });
    setLoading(false);

    if (error) {
      setAlertMessage("❌ Invalid OTP. Please try again.");
      setShowAlert(true);
      return;
    }

    setOtpVerified(true);
    setShowToast(true);
    setAlertMessage("✅ OTP verified successfully!");
    setShowAlert(true);
  };

  const doRegister = async () => {
    if (!otpVerified) {
      setAlertMessage("⚠️ Please verify your phone number first.");
      setShowAlert(true);
      return;
    }

    if (!username || !firstName || !lastName || !password) {
      setAlertMessage("⚠️ Please fill in all fields.");
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { error: dbError } = await supabase.from("users").insert([
        {
          username,
          user_phone: phoneNumber,
          user_firstname: firstName,
          user_lastname: lastName,
          user_password: hashedPassword,
          role: "user",
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage("An unexpected error occurred.");
      }
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="background-wrapper">
          <div className="overlay">
            <div className="register-layout">
              <div className="left-panel">
                <img src={logo} alt="Cooperative Logo" className="coop-logo" />
                <h2>Mantibugao Agrarian Reform Beneficiaries Farmers’ Cooperative</h2>
              </div>

              <div className="right-panel">
                <div className="register-box">
                  <IonButton fill="clear" className="back-button" onClick={() => navigation.push("/login")}>←</IonButton>

                  <h2 className="welcome">Create an Account</h2>
                  <p className="instruction">Fill in your details to register</p>

                  <label className="label">Username</label>
                  <IonInput placeholder="Enter your username" value={username} onIonChange={(e) => setUsername(e.detail.value!)} />

                  <label className="label">First Name</label>
                  <IonInput placeholder="Enter first name" value={firstName} onIonChange={(e) => setFirstName(e.detail.value!)} />

                  <label className="label">Last Name</label>
                  <IonInput placeholder="Enter last name" value={lastName} onIonChange={(e) => setLastName(e.detail.value!)} />

                  <label className="label">Phone Number</label>
                  <IonInput placeholder="Enter phone (e.g. +639123456789)" type="tel" value={phoneNumber} onIonChange={(e) => setPhoneNumber(e.detail.value!)} disabled={otpSent} />

                  {!otpSent && (
                    <IonButton expand="block" onClick={sendOtpPhone} disabled={loading || !phoneNumber}>
                      {loading ? <><IonSpinner name="crescent" style={{marginRight: 8}} /> Sending OTP...</> : "Send OTP"}
                    </IonButton>
                  )}

                  {otpSent && !otpVerified && (
                    <>
                      <label className="label">Enter OTP</label>
                      <IonInput placeholder="OTP" value={otp} onIonChange={(e) => setOtp(e.detail.value!)} />

                      <IonButton expand="block" onClick={verifyOtpPhone} disabled={loading}>
                        {loading ? <><IonSpinner name="crescent" style={{marginRight: 8}} /> Verifying...</> : "Verify OTP"}
                      </IonButton>

                      <IonButton fill="clear" onClick={sendOtpPhone} style={{marginTop: "8px"}}>Resend OTP</IonButton>
                    </>
                  )}

                  {otpVerified && (
                    <>
                      <label className="label">Password</label>
                      <IonInput type="password" placeholder="Enter Password" value={password} onIonChange={(e) => setPassword(e.detail.value!)} />
                      
                      <div className="terms-container">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                        <label>I agree to the <span style={{color:"#0078d7", cursor:"pointer"}} onClick={()=>setShowTermsModal(true)}>Terms and Conditions</span></label>
                      </div>

                      <IonButton expand="block" onClick={doRegister} disabled={loading || !agreed}>
                        {loading ? "Registering..." : "Register"}
                      </IonButton>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        <IonAlert isOpen={showAlert} onDidDismiss={() => setShowAlert(false)} header="Notification" message={alertMessage} buttons={["OK"]} />
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message="✅ OTP verified!" duration={1500} position="top" color="success" />

        <IonModal isOpen={showSuccessModal} onDidDismiss={() => setShowSuccessModal(false)}>
          <IonContent className="ion-padding">
            <h2>Registration Successful!</h2>
            <p>You can now log in with your account.</p>
            <IonButton expand="block" onClick={() => navigation.push("/login")}>Go to Login</IonButton>
          </IonContent>
        </IonModal>

        <IonModal isOpen={showTermsModal} onDidDismiss={() => setShowTermsModal(false)}>
          <IonContent className="ion-padding" scrollY>
            <h2>Terms and Conditions</h2>
            <p>By creating an account, you agree to the following terms:</p>
            <ul>
              <li>Your personal data will be stored securely.</li>
              <li>Do not share your password.</li>
              <li>Misuse will result in account suspension.</li>
              <li>Terms may be updated anytime.</li>
              <li>Continued use means acceptance of changes.</li>
            </ul>
            <IonButton expand="block" onClick={() => setShowTermsModal(false)}>Close</IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Registerphone;
