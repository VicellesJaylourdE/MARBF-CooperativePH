import { useState } from "react";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonToast,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  useIonRouter,
} from "@ionic/react";
import bcrypt from "bcryptjs";
import { supabase } from "../utils/supabaseClient";
import logo from "../assets/logo.png";

const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({
  message,
  isOpen,
  onClose,
}) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Notification"
      message={message}
      buttons={["OK"]}
    />
  );
};

const Login: React.FC = () => {
  const navigation = useIonRouter();

  const [segment, setSegment] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (segment === "email") {
      if (!email || !password) {
        setAlertMessage("⚠️ Please enter both email and password.");
        setShowAlert(true);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoading(false);
        setAlertMessage("❌ " + error.message);
        setShowAlert(true);
        return;
      }
      await sendOtp("email");
      setLoading(false);
    } else {
      if (!phone || !password) {
        setAlertMessage("⚠️ Please enter both phone and password.");
        setShowAlert(true);
        return;
      }
      setLoading(true);

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("user_phone", phone)
        .single();

      if (userError || !user) {
        setLoading(false);
        setAlertMessage("❌ Phone number not found.");
        setShowAlert(true);
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.user_password);
      if (!passwordMatch) {
        setLoading(false);
        setAlertMessage("❌ Incorrect password.");
        setShowAlert(true);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        setAlertMessage("⚠️ Failed to send OTP: " + error.message);
        setShowAlert(true);
      } else {
        setOtpSent(true);
        setAlertMessage("📩 OTP sent to your phone.");
        setShowAlert(true);
      }
      setLoading(false);
    }
  };

  const sendOtp = async (type: "email" | "phone") => {
    const { error } =
      type === "email"
        ? await supabase.auth.signInWithOtp({ email })
        : await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setAlertMessage("⚠️ Failed to send OTP: " + error.message);
      setShowAlert(true);
    } else {
      setOtpSent(true);
      setAlertMessage("📩 OTP sent! Please check your inbox or SMS.");
      setShowAlert(true);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setAlertMessage("⚠️ Please enter the OTP.");
      setShowAlert(true);
      return;
    }

    const { error } = await supabase.auth.verifyOtp(
      segment === "email"
        ? { email, token: otp, type: "email" }
        : { phone, token: otp, type: "sms" }
    );

    if (error) {
      setAlertMessage("❌ Invalid OTP. Please try again.");
      setShowAlert(true);
      return;
    }

    setOtpVerified(true);
    setShowToast(true);
    setAlertMessage("✅ OTP verified successfully!");
    setShowAlert(true);

    await fetchUser();
  };

  const fetchUser = async () => {
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("*")
      .eq(segment === "email" ? "user_email" : "user_phone", segment === "email" ? email : phone)
      .single();

    if (roleError || !userData) {
      setAlertMessage("⚠️ User record not found. Redirecting...");
      setShowAlert(true);
      navigation.push("/user-dashboard", "forward", "replace");
      return;
    }

    const fullName = `${userData.user_firstname || ""} ${userData.user_lastname || ""}`.trim();

    const userInfo = {
      id: userData.user_id,
      username: userData.username,
      firstname: userData.user_firstname,
      lastname: userData.user_lastname,
      fullname: fullName,
      email: userData.user_email,
      phone: userData.user_phone,
      role: userData.role,
    };

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setAlertMessage(`👋 Welcome back, ${fullName || userData.username}!`);
    setShowAlert(true);

    setTimeout(() => {
      if (userData.role === "admin") {
        navigation.push("/admin-dashboard", "forward", "replace");
      } else if (userData.role === "staff") {
        navigation.push("/staff-dashboard", "forward", "replace");
      } else {
        navigation.push("/user-dashboard", "forward", "replace");
      }
    }, 1000);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="background-wrapper">
          <div className="overlay">
            <div className="login-layout">
              <div className="left-panel">
                <img src={logo} alt="Cooperative Logo" className="coop-logo" />
                <h2>Mantibugao Agrarian Reform Beneficiaries Farmers’ Cooperative</h2>
              </div>

              <div className="right-panel">
                <div className="login-box">
                  <IonButton
                    fill="clear"
                    className="back-button"
                    onClick={() => navigation.push("/Landingpage")}
                  >
                    ←
                  </IonButton>

                  <IonSegment
                    value={segment}
                    onIonChange={(e) => setSegment(e.detail.value as "email" | "phone")}
                    className="segment"
                  >
                    <IonSegmentButton value="email">
                      <IonLabel>Email</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="phone">
                      <IonLabel>Phone</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>

                  {!otpSent && (
                    <>
                      <h2 className="welcome">Welcome Back!</h2>
                      <p className="instruction">Sign in with your {segment}</p>

                      {segment === "email" ? (
                        <>
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
                            placeholder="Enter your password"
                            type="password"
                            fill="outline"
                            className="input"
                            value={password}
                            onIonChange={(e) => setPassword(e.detail.value!)}
                          >
                            <IonInputPasswordToggle slot="end" />
                          </IonInput>

                          <span
                            className="forgot"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigation.push("/forgot-password")}
                          >
                            Forgot Password?
                          </span>
                        </>
                      ) : (
                        <>
                          <label className="label">Phone Number</label>
                          <IonInput
                            placeholder="Enter your phone number"
                            type="tel"
                            fill="outline"
                            className="input"
                            value={phone}
                            onIonChange={(e) => setPhone(e.detail.value!)}
                          />

                          <label className="label">Password</label>
                          <IonInput
                            placeholder="Enter your password"
                            type="password"
                            fill="outline"
                            className="input"
                            value={password}
                            onIonChange={(e) => setPassword(e.detail.value!)}
                          >
                            <IonInputPasswordToggle slot="end" />
                          </IonInput>
                        </>
                      )}

                      <IonButton
                        onClick={doLogin}
                        expand="block"
                        fill="solid"
                        className="login-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <IonSpinner
                              name="crescent"
                              color="light"
                              style={{ marginRight: "8px" }}
                            />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </IonButton>

                      {/* 🆕 Added Signup Link */}
                      <div className="signup-link">
                        <span>Don't have an account? </span>
                        <a
                          onClick={() => navigation.push("/registerone")}
                          style={{ color: "#0078d7", cursor: "pointer", fontWeight: 500 }}
                        >
                          Sign up
                        </a>
                      </div>
                    </>
                  )}

                  {otpSent && !otpVerified && (
                    <>
                      <h2 className="welcome">Verify OTP</h2>
                      <p className="instruction">
                        We sent an OTP to your {segment === "email" ? "email" : "phone"}.
                      </p>

                      <label className="label">Enter OTP</label>
                      <IonInput
                        placeholder="Enter OTP"
                        type="text"
                        fill="outline"
                        className="input"
                        value={otp}
                        onIonChange={(e) => setOtp(e.detail.value!)}
                      />

                      <IonButton
                        onClick={verifyOtp}
                        expand="block"
                        fill="solid"
                        className="login-btn"
                        disabled={loading}
                      >
                        Verify OTP
                      </IonButton>

                      <IonButton
                        fill="clear"
                        onClick={() => sendOtp(segment)}
                        style={{ marginTop: "8px", color: "#0078d7" }}
                      >
                        Resend OTP
                      </IonButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertBox message={alertMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="✅ OTP verified! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>

      <style>{`
        .background-wrapper { position: relative; width: 100%; height: 100vh; background: url('/assets/bg-farm.jpg') no-repeat center center/cover; }
        .overlay { width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; }
        .login-layout { display: flex; width: 85%; max-width: 850px; height: 80vh; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        .left-panel { flex: 1; background: #ffd500ff; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 30px; }
        .coop-logo { width: 140px; margin-bottom: 15px; }
        .left-panel h2 { font-size: 18px; font-weight: 500; line-height: 1.4; max-width: 300px; }
        .right-panel { flex: 1; background: #ffffffd9; backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; }
        .login-box { width: 90%; max-width: 300px; text-align: left; }
        .back-button { padding: 0; margin-bottom: 15px; font-size: 20px; color: #FCB53B; }
        .welcome { font-size: 20px; font-weight: 600; color: #FCB53B; margin-bottom: 5px; }
        .instruction { font-size: 13px; color: #555; margin-bottom: 20px; }
        .label { display: block; text-align: left; font-size: 13px; color: #333; margin-bottom: 4px; }
        .input { width: 100%; margin-bottom: 12px; --highlight-color-focused: #555555ff; --border-color: #000000ff; --color: #333; }
        .forgot { display: block; text-align: right; font-size: 12px; color: #0078d7; margin-bottom: 12px; text-decoration: none; }
        .login-btn { --background: #FCB53B; --color: white; border-radius: 6px; width: 100%; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; }
        .signup-link { text-align: center; font-size: 13px; color: #333; }
        @media (max-width: 768px) {
          .login-layout { flex-direction: column; width: 90%; height: auto; }
          .left-panel { display: none; }
          .right-panel { padding: 25px; border-radius: 12px; }
          .login-box { width: 100%; max-width: 280px; }
        }
      `}</style>
    </IonPage>
  );
};

export default Login;
