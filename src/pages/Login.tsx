import { useState } from "react";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonToast,
  useIonRouter,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import loginBg from "../assets/Background3.png";
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

  const doLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
      return;
    }

    const user = data.user;
    if (!user) {
      setAlertMessage("User not found.");
      setShowAlert(true);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("user_email", email)
      .single();

    if (userError || !userData) {
      setAlertMessage("Unable to fetch user role.");
      setShowAlert(true);
      return;
    }

    setShowToast(true);

    setTimeout(() => {
      if (userData.role === "admin") {
        navigation.push("/admin-dashboard", "forward", "replace");
      } else if (userData.role === "staff") {
        navigation.push("/staff-dashboard", "forward", "replace");
      } else {
        navigation.push("/user-dashboard", "forward", "replace");
      }
    }, 300);
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{
          "--background": "none",
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="login-layout">
          {/* Desktop left-panel */}
          <div className="left-panel">
            <img src={logo} alt="Logo" className="logo" />
            <h2>Mantibugao Agrarian Reform Beneficiaries Farmers’ Cooperative</h2>
          </div>

          {/* Right side form */}
          <div className="right-panel">
            <div className="login-card">
              {/* Logo inside form (mobile only) */}
              <img src={logo} alt="Logo" className="logo mobile-logo" />

              <h1 className="login-title">Welcome back!</h1>
              <p className="login-subtitle">
                Sign in with your email and password
              </p>

              <label className="label">Email Address</label>
              <IonInput
                placeholder="Your Email"
                type="email"
                fill="outline"
                className="input-field"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />

              <label className="label">Password</label>
              <IonInput
                placeholder="Enter your password"
                type="password"
                fill="outline"
                className="input-field"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>

              <IonButton
                onClick={doLogin}
                expand="block"
                fill="solid"
                className="login-btn"
              >
                Sign In
              </IonButton>

              <IonButton
                routerLink="/MARBF-CooperativePH"
                expand="block"
                fill="clear"
                className="register-btn"
              >
                Back to Homepage
              </IonButton>
            </div>
          </div>
        </div>

        {/* Alerts & Toast */}
        <AlertBox
          message={alertMessage}
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
        />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Login successful! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>

      {/* STYLE */}
      <style>
        {`
          .login-layout {
            display: flex;
            flex-direction: row;
            height: 100%;
            width: 100%;
          }
          .left-panel {
            flex: 1;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 50px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
          .left-panel .logo {
            width: 250px;
            margin-bottom: 20px;
          }
          .right-panel {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
          }
          .login-card {
            width: 360px;
            padding: 25px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
         .login-title {
          font-size: 22px;
          font-weight: bold;
          color: black;
          margin-bottom: 5px; /* tighter spacing */
          } 

          .login-subtitle {
          font-size: 14px;
          color: #333;
          text-align: center;
          margin-bottom: 30px; /* reduced spacing */
          }
          .label {
            align-self: flex-start;
            margin-bottom: 5px;
            font-size: 14px;
            color: #333;
          }
          .input-field {
            width: 100%;
            margin-bottom: 12px;
            --highlight-color-focused: #8b8888ff;
            --border-color: #1976d2;
            --color: black;
          }
          .login-btn {
            --background: #FCB53B;
            --color: white;
            width: 100%;
            margin-top: 10px;
          }
          .register-btn {
            --color: #FCB53B;
            margin-top: 8px;
            font-weight: bold;
            text-transform: none;
          }

          /* Hide mobile logo by default */
          .mobile-logo {
            display: none;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .login-layout {
              flex-direction: column;
              align-items: center;
              text-align: left;
            }
            .left-panel {
              display: none; /* Hide left side on mobile */
            }
            .mobile-logo {
              display: block;
              width: 50px;
              margin-bottom: 1px;
            }
            .right-panel {
              padding: 20px;
              width: 100%;
            }
            .login-card {
              width: 100%;
              max-width: 360px;
            }
          }
        `}
      </style>
    </IonPage>
  );
};

export default Login;
