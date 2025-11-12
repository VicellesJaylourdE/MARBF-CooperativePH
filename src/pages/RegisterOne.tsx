import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonAlert,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonToast,
  useIonRouter,
  IonInputPasswordToggle,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";
// import logo from "../assets/Gemini_Generated_Image_lh66iclh66iclh66-removebg-preview.png"; // Gikuha ang logo import

const RegisterOne: React.FC = () => {
  const navigation = useIonRouter();

  const [segment, setSegment] = useState<string>("email");

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [email, setEmail] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const doRegisterEmail = async () => {
    try {
      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw new Error(signUpError.message);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { error: dbError } = await supabase.from("users").insert([
        {
          username,
          user_email: email,
          user_firstname: firstName,
          user_lastname: lastName,
          user_password: hashedPassword,
          role: "user",
        },
      ]);

      if (dbError) throw new Error(dbError.message);
      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof Error) setAlertMessage(error.message);
      else setAlertMessage("An unexpected error occurred.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

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
    setAlertMessage("📩 OTP sent to " + phoneNumber);
    setShowAlert(true);
  };

  const verifyOtpPhone = async () => {
    if (!otp) {
      setAlertMessage("⚠️ Please enter the OTP.");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: "sms",
    });
    setLoading(false);

    if (error) {
      setAlertMessage("❌ Invalid OTP. Please try again.");
      setShowAlert(true);
      return;
    }

    setOtpVerified(true);
    setShowToast(true);
  };

  const doRegisterPhone = async () => {
    if (!otpVerified) {
      setAlertMessage("⚠️ Please verify your phone number first.");
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
      if (error instanceof Error) setAlertMessage(error.message);
      else setAlertMessage("An unexpected error occurred.");
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
              {/* Gikuha ang left-panel nga naa ang logo ug color/background */}
              <div className="right-panel">
                <div className="register-box">
                  <IonSegment
                    value={segment}
                    color="warning"
                    onIonChange={(e) => setSegment(e.detail.value as string)}
                  >
                    <IonSegmentButton value="email">
                      <IonLabel>Email</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="phone">
                      <IonLabel>Phone</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>

                  <h2 className="welcome">Create an Account</h2>

                  <div style={{ marginTop: "15px" }}>
                    {segment === "email" && (
                      <>
                        <label className="label">Username</label>
                        <IonInput
                          placeholder="Enter your username"
                          fill="outline"
                          className="input"
                          value={username}
                          onIonChange={(e) => setUsername(e.detail.value!)}
                        />

                        <div className="name-row">
                          <div className="name-field">
                            <label className="label">First Name</label>
                            <IonInput
                              placeholder="Enter your first name"
                              fill="outline"
                              className="input"
                              value={firstName}
                              onIonChange={(e) => setFirstName(e.detail.value!)}
                            />
                          </div>
                          <div className="name-field">
                            <label className="label">Last Name</label>
                            <IonInput
                              placeholder="Enter your last name"
                              fill="outline"
                              className="input"
                              value={lastName}
                              onIonChange={(e) => setLastName(e.detail.value!)}
                            />
                          </div>
                        </div>

                        <div className="name-row">
                          <div className="name-field">
                            <label className="label">Email Address</label>
                            <IonInput
                              placeholder="Your Email"
                              type="email"
                              fill="outline"
                              className="input"
                              value={email}
                              onIonChange={(e) => setEmail(e.detail.value!)}
                            />
                          </div>
                          <div className="name-field">
                            <label className="label">Password</label>
                            <IonInput
                              placeholder="Enter Password"
                              type="password"
                              fill="outline"
                              className="input"
                              value={password}
                              onIonChange={(e) => setPassword(e.detail.value!)}
                            >
                              <IonInputPasswordToggle
                                slot="end"
                                color="warning"
                              />
                            </IonInput>
                          </div>
                        </div>

                        <IonButton
                          expand="block"
                          fill="solid"
                          className="register-btn"
                          onClick={doRegisterEmail}
                          disabled={loading || !agreed}
                        >
                          {loading ? "Registering..." : "Register"}
                        </IonButton>
                      </>
                    )}

                    {segment === "phone" && (
                      <>
                        <label className="label">Username</label>
                        <IonInput
                          placeholder="Enter your username"
                          fill="outline"
                          className="input"
                          value={username}
                          onIonChange={(e) => setUsername(e.detail.value!)}
                        />

                        <div className="name-row">
                          <div className="name-field">
                            <label className="label">First Name</label>
                            <IonInput
                              placeholder="Enter your first name"
                              fill="outline"
                              className="input"
                              value={firstName}
                              onIonChange={(e) => setFirstName(e.detail.value!)}
                            />
                          </div>
                          <div className="name-field">
                            <label className="label">Last Name</label>
                            <IonInput
                              placeholder="Enter your last name"
                              fill="outline"
                              className="input"
                              value={lastName}
                              onIonChange={(e) => setLastName(e.detail.value!)}
                            />
                          </div>
                        </div>

                        <label className="label">Phone Number</label>
                        <IonInput
                          placeholder="Enter phone (e.g. +639123456789)"
                          type="tel"
                          fill="outline"
                          className="input"
                          value={phoneNumber}
                          onIonChange={(e) => setPhoneNumber(e.detail.value!)}
                          disabled={otpSent}
                        />

                        {!otpSent && (
                          <IonButton
                            expand="block"
                            onClick={sendOtpPhone}
                            color="warning"
                            disabled={loading || !phoneNumber}
                          >
                            {loading ? (
                              <>
                                <IonSpinner name="crescent" />
                                Sending OTP...
                              </>
                            ) : (
                              "Send OTP"
                            )}
                          </IonButton>
                        )}

                        {otpSent && !otpVerified && (
                          <>
                            <label className="label">Enter OTP</label>
                            <IonInput
                              placeholder="OTP"
                              fill="outline"
                              className="input"
                              value={otp}
                              onIonChange={(e) => setOtp(e.detail.value!)}
                            />
                            <IonButton
                              expand="block"
                              onClick={verifyOtpPhone}
                              disabled={loading}
                            >
                              {loading ? "Verifying..." : "Verify OTP"}
                            </IonButton>
                          </>
                        )}

                        {otpVerified && (
                          <>
                            <label className="label">Password</label>
                            <IonInput
                              placeholder="Enter Password"
                              type="password"
                              fill="outline"
                              className="input"
                              value={password}
                              onIonChange={(e) =>
                                setPassword(e.detail.value!)
                              }
                            />
                            <div className="terms-container">
                              <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) =>
                                  setAgreed(e.target.checked)
                                }
                              />
                            </div>
                            <IonButton
                              expand="block"
                              onClick={doRegisterPhone}
                              disabled={loading || !agreed}
                            >
                              {loading ? "Registering..." : "Register"}
                            </IonButton>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notice"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="✅ OTP Verified!"
          duration={1500}
          position="top"
          color="success"
        />

        <IonModal
          isOpen={showSuccessModal}
          onDidDismiss={() => setShowSuccessModal(false)}
        >
          <IonContent className="ion-padding">
            <h2>Registration Successful!</h2>
            <p>You can now log in with your account.</p>
            <IonButton expand="block" onClick={() => navigation.push("/login")}>
              Go to Login
            </IonButton>
          </IonContent>
        </IonModal>

        <IonModal
          isOpen={showTermsModal}
          onDidDismiss={() => setShowTermsModal(false)}
        >
          <IonContent className="ion-padding" scrollY>
            {/* Terms and conditions content here */}
          </IonContent>
        </IonModal>
      </IonContent>

      <style>{`
        .background-wrapper { 
          position: relative; 
          width: 100%; 
          height: 100vh; 
          background: url('/assets/bg-farm.jpg') no-repeat center center/cover; 
        }
        .overlay { 
          width: 100%; 
          height: 100%; 
          background-color: rgba(0,0,0,0.4); 
          display: flex; 
          justify-content: center; 
          align-items: center; 
        }
        .register-layout { 
          display: flex; 
          width: 85%; 
          max-width: 400px; /* Gikunhoran ang max-width para mag center lang ang form */
          height: 85vh; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          /* Gikuha ang flex-direction: row or column kay usa na lang ka panel */
          
        }
        /* Gikuha ang .left-panel CSS */
        
        .right-panel { 
          flex: 1; /* Gihimo nga mo-okupar sa tibuok register-layout */
          background: #ffffffd9; 
          backdrop-filter: blur(10px); 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          padding: 30px; /* Dugang padding para mas nindot tan-awon */
        }
        .register-box { 
          width: 100%; /* Gihimo nga 100% sa sulod sa right-panel */
          max-width: 340px; /* Pwede ra tangtangon kung gusto nimo mas lapad */
          text-align: left; 
        }
        .back-button { 
          padding: 0; 
          margin-bottom: 0px; 
          font-size: 20px; 
          color: #FCB53B; 
        }
        .welcome { 
          font-size: 20px; 
          font-weight: 600; 
          color: #FCB53B; 
          margin-bottom: 5px; 
        }
        .instruction { 
          font-size: 13px; 
          color: #555; 
          margin-bottom: 20px; 
        }
        .label { 
          display: block; 
          font-size: 13px; 
          color: #333; 
          margin-bottom: 4px; 
        }
        .input { 
          width: 100%; 
          margin-bottom: 12px; 
          --highlight-color-focused: #555555ff; 
          --border-color: #000000ff; 
          --color: #333; 
        }
        .name-row { 
          display: flex; 
          gap: 10px; 
        }
        .name-field { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
        }
        .register-btn { 
          --background: #FCB53B; 
          --color: white; 
          border-radius: 6px; 
          width: 100%; 
          margin-top: 10px; 
        }
        .signup-text { 
          font-size: 12px; 
          color: #333; 
          text-align: center; 
          margin-top: 10px; 
        }
        .signup-link { 
          color: #0078d7; 
          text-decoration: none; 
          font-weight: 500; 
        }
        .terms-container { 
          font-size: 12px; 
          color: #333; 
          margin-bottom: 10px; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
        }
        @media (max-width: 768px) { 
          .register-layout { 
            flex-direction: column; 
            width: 90%; 
            height: auto; 
            max-width: 90%; /* Adjust for smaller screens */
          } 
          /* Gikuha ang .left-panel media query */
          .right-panel { 
            padding: 25px; 
            border-radius: 12px; 
          } 
          .register-box { 
            width: 100%; 
            max-width: 100%; /* Gihimo nga 100% sa sulod sa right-panel */
          } 
          .name-row { 
            display: flex; 
            flex-direction: row; 
            gap: 8px; 
          }
          .name-field { 
            flex: 1; 
          }
        }
      `}</style>
    </IonPage>
  );
};

export default RegisterOne;