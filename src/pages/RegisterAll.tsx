import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonAlert,
  IonModal,
  IonInputPasswordToggle,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";
import logo from "../assets/logo.png"; // same logo used in login

const RegisterAll: React.FC = () => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const doRegister = async () => {
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
                <h2>
                  Mantibugao Agrarian Reform Beneficiaries Farmers’ Cooperative
                </h2>
              </div>

              <div className="right-panel">
                <div className="register-box">
                  <IonButton fill="clear" className="back-button" routerLink="/login">
                    ←
                  </IonButton>

                  <h2 className="welcome">Create an Account</h2>
                  <p className="instruction">Fill in your details to register</p>

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
                        <IonInputPasswordToggle slot="end" />
                      </IonInput>
                    </div>
                  </div>

                  <IonButton
                    expand="block"
                    fill="solid"
                    className="register-btn"
                    onClick={doRegister}
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register"}
                  </IonButton>

                  <p className="signup-text">
                    Already have an account?{" "}
                    <a href="/login" className="signup-link">
                      Log In
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonModal
          isOpen={showSuccessModal}
          onDidDismiss={() => setShowSuccessModal(false)}
        >
          <IonContent className="ion-padding">
            <h2>Registration Successful!</h2>
            <p>You can now log in with your account.</p>
            <IonButton expand="block" routerLink="/login" style={{ marginTop: "1rem" }}>
              Go to Login
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>

      <style>
        {`
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
            max-width: 850px;
            height: 85vh;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          }

          .left-panel {
            flex: 1;
            background: #ffd500ff;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 30px;
          }

          .coop-logo {
            width: 140px;
            margin-bottom: 15px;
          }

          .left-panel h2 {
            font-size: 18px;
            font-weight: 500;
            line-height: 1.4;
            max-width: 300px;
          }

          .right-panel {
            flex: 1;
            background: #ffffffd9;
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .register-box {
            width: 90%;
            max-width: 300px;
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

          /* 👇 STYLE FOR ABAY LAYOUTS */
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

          .signup-link:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .register-layout {
              flex-direction: column;
              width: 90%;
              height: auto;
            }

            .left-panel {
              display: none;
            }

            .right-panel {
              padding: 25px;
              border-radius: 12px;
            }

            .register-box {
              width: 100%;
              max-width: 280px;
            }

            .name-row {
              flex-direction: column;
              gap: 0;
            }
          }
        `}
      </style>
    </IonPage>
  );
};

export default RegisterAll;
