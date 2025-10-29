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
  useIonRouter,
} from "@ionic/react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setLoading(true);
    setAlertMessage("");
    setShowAlert(false);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setAlertMessage("⚠️ " + error.message);
      setShowAlert(true);
      return;
    }

    const user = data.user;
    if (!user) {
      setLoading(false);
      setAlertMessage("❌ User not found. Please check your credentials.");
      setShowAlert(true);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("user_email", email)
      .single();

    if (userError || !userData) {
      setLoading(false);
      setAlertMessage("⚠️ Unable to fetch user role. Please try again.");
      setShowAlert(true);
      return;
    }

    setShowToast(true);

    setTimeout(() => {
      setLoading(false);
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

                  <h2 className="welcome">Welcome Back!</h2>
                  <p className="instruction">Sign in with your email and password</p>

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

                  {/* Forgot Password */}
                  <span
                    className="forgot"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigation.push("/forgot-password")}
                  >
                    Forgot Password?
                  </span>

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

                
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertBox
          message={alertMessage}
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
        />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="✅ Login successful! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>

      {/* Styles (unchanged) */}
      <style>{`
        .background-wrapper { position: relative; width: 100%; height: 100vh; background: url('/assets/bg-farm.jpg') no-repeat center center/cover; }
        .overlay { width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; }
        .login-layout { 
        display: flex; width: 85%;
        max-width: 850px; height: 80vh; 
        border-radius: 12px; 
        overflow: hidden;
        box-shadow: 
        0 6px 20px rgba(0,0,0,0.25); 
          }
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
        .login-btn { --background: #FCB53B; --color: white; border-radius: 6px; width: 100%; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; }
        .signup-text { font-size: 12px; color: #333; text-align: center; margin-top: 10px; }
        .signup-link { color: #0078d7; text-decoration: none; font-weight: 500; }
        @media (max-width: 768px) 
        { 
        .login-layout { 
        flex-direction: column; 
        width: 90%; height: auto;
         } 
         .login-layout { 
        display: flex; 
        width: 75%;
        max-width: 850px;
         height: 80vh; 
        border-radius: 12px; 
        overflow: hidden;
        box-shadow: 
        0 6px 20px rgba(0,0,0,0.25); 
          }
        .left-panel 
        { display: none;
         } 
        .right-panel 
          { 
         padding: 25px; 
           border-radius: 12px;
            } 
           .login-box 
           { width: 100%; 
            max-width: 280px;
             } 
            }
      `}</style>
    </IonPage>
  );
};

export default Login;
