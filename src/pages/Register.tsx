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
  // Gi-import ang IonSelect ug IonSelectOption
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";
// import logo from "../assets/Gemini_Generated_Image_lh66iclh66iclh66-removebg-preview.png"; // Gikuha ang logo import

const Register: React.FC = () => {
  const navigation = useIonRouter();

  const [segment, setSegment] = useState<string>("email");

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  // 1. New State for User Role
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'staff'>('user'); // Default to 'user'

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
          role: userRole,
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

      // 3. I-apil ang userRole sa insertion
      const { error: dbError } = await supabase.from("users").insert([
        {
          username,
          user_phone: phoneNumber,
          user_firstname: firstName,
          user_lastname: lastName,
          user_password: hashedPassword,
          role: userRole, // Giusab ang hardcoded 'user' value
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

                        <label className="label">Email Address</label>
                        <IonInput
                          placeholder="Your Email"
                          type="email"
                          fill="outline"
                          className="input"
                          value={email}
                          onIonChange={(e) => setEmail(e.detail.value!)}
                        />

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
                        
                        <label className="label">User Role</label>
                        <IonSelect
                          value={userRole}
                          placeholder="Select Role"
                          onIonChange={(e) => setUserRole(e.detail.value)}
                          fill="outline"
                          className="input"
                        >
                          <IonSelectOption value="user">User (Default)</IonSelectOption>
                          <IonSelectOption value="staff">Staff</IonSelectOption>
                          <IonSelectOption value="admin">Admin</IonSelectOption>
                        </IonSelect>
                        {/* End Role Select */}

                        <div className="terms-container">
                            <input
                              type="checkbox"
                              checked={agreed}
                              onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <IonLabel onClick={() => setShowTermsModal(true)}>I agree to the Terms and Conditions</IonLabel>
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
                            
                            <label className="label">User Role</label>
                            <IonSelect
                              value={userRole}
                              placeholder="Select Role"
                              onIonChange={(e) => setUserRole(e.detail.value)}
                              fill="outline"
                              className="input"
                            >
                              <IonSelectOption value="user">User (Default)</IonSelectOption>
                              <IonSelectOption value="staff">Staff</IonSelectOption>
                              <IonSelectOption value="admin">Admin</IonSelectOption>
                            </IonSelect>
                            {/* End Role Select */}
                            
                            <div className="terms-container">
                                <input
                                  type="checkbox"
                                  checked={agreed}
                                  onChange={(e) =>
                                    setAgreed(e.target.checked)
                                  }
                                />
                                <IonLabel onClick={() => setShowTermsModal(true)}>I agree to the Terms and Conditions</IonLabel>
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
            <p>The account has been created with role: **{userRole.toUpperCase()}**.</p>
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
            <h3>Terms and Conditions</h3>
            <p>1. Usage Policy...</p>
            <p>2. Privacy Notice...</p>
            <IonButton expand="block" onClick={() => setShowTermsModal(false)} style={{marginTop: '20px'}}>Close</IonButton>
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
          max-width: 400px; 
          height: auto; /* Changed to auto to fit content */
          padding: 30px 0; /* Adjusted padding */
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .right-panel { 
          flex: 1; 
          background: #ffffffd9; 
          backdrop-filter: blur(10px); 
          display: flex; 
          justify-content: center; 
          align-items: flex-start; /* Align content to the top */
          padding: 30px; 
        }
        .register-box { 
          width: 100%; 
          max-width: 340px; 
          text-align: left; 
        }
        /* ... (Keep existing CSS styles) ... */
        .welcome { 
          font-size: 20px; 
          font-weight: 600; 
          color: #FCB53B; 
          margin-bottom: 5px; 
        }
        .label { 
          display: block; 
          font-size: 13px; 
          color: #333; 
          margin-bottom: 4px; 
          margin-top: 10px; /* Added margin top for spacing */
        }
        .input { 
          width: 100%; 
          margin-bottom: 0px; 
          --highlight-color-focused: #555555ff; 
          --border-color: #000000ff; 
          --color: #333; 
        }
        .name-row { 
          display: flex; 
          gap: 10px; 
          margin-bottom: 0px; 
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
          margin-top: 15px; /* Increased margin top */
        }
        .terms-container { 
          font-size: 12px; 
          color: #333; 
          margin-bottom: 10px; 
          margin-top: 10px; /* Added margin top */
          display: flex; 
          align-items: center; 
          gap: 6px; 
        }
        /* Mobile adjustments */
        @media (max-width: 768px) { 
          .register-layout { 
            width: 90%; 
            height: auto; 
            max-width: 90%;
            padding: 20px 0;
          } 
          .right-panel { 
            padding: 20px; 
          } 
          .name-row { 
            flex-direction: row; 
            gap: 8px; 
          }
        }
      `}</style>
    </IonPage>
  );
};

export default Register;