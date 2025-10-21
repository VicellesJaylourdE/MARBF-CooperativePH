import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonAlert,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInputPasswordToggle,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';
import bcrypt from 'bcryptjs';

const Admin_RegisterMember: React.FC = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user' | 'staff'>('user');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const doRegister = async () => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw new Error(signUpError.message);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { error: dbError } = await supabase.from('users').insert([
        {
          username,
          user_email: email,
          user_firstname: firstName,
          user_lastname: lastName,
          user_password: hashedPassword,
          role,
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage('An unexpected error occurred.');
      }
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <IonCardHeader>
            <IonCardTitle style={{ fontWeight: 'bold', textAlign: 'center', color: '#1a73e8' }}>
              Register Member
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Excel-style container */}
            <div
              style={{
                overflowX: 'auto',
                border: '2px solid #c2c2c2',
                borderRadius: '8px',
                backgroundColor: '#fdfdfd',
              }}
            >
              <table style={tableStyle}>
                <tbody>
                  <tr style={rowStyle}>
                    <td style={headerCellStyle}>Username</td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Enter Username"
                        value={username}
                        onIonChange={(e) => setUsername(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={headerCellStyle}>First Name</td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Enter First Name"
                        value={firstName}
                        onIonChange={(e) => setFirstName(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={headerCellStyle}>Last Name</td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Enter Last Name"
                        value={lastName}
                        onIonChange={(e) => setLastName(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={headerCellStyle}>Email</td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Enter Email"
                        type="email"
                        value={email}
                        onIonChange={(e) => setEmail(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={headerCellStyle}>Password</td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Enter Password"
                        type="password"
                        value={password}
                        onIonChange={(e) => setPassword(e.detail.value!)}
                      >
                        <IonInputPasswordToggle slot="end" />
                      </IonInput>
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={headerCellStyle}>Role</td>
                    <td style={cellStyle}>
                      <IonSelect
                        value={role}
                        placeholder="Select Role"
                        onIonChange={(e) => setRole(e.detail.value)}
                      >
                        <IonSelectOption value="admin">Admin</IonSelectOption>
                        <IonSelectOption value="staff">Staff</IonSelectOption>
                        <IonSelectOption value="user">User</IonSelectOption>
                      </IonSelect>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <IonButton
              expand="block"
              onClick={doRegister}
              style={{
                marginTop: '1.2rem',
                fontWeight: '600',
                backgroundColor: '#c9c900ff',
              }}
            >
              Register
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={['OK']}
        />

        <IonModal isOpen={showSuccessModal} onDidDismiss={() => setShowSuccessModal(false)}>
          <IonContent className="ion-padding">
            <h2 style={{ textAlign: 'center', color: '#d80000ff' }}>Registration Successful!</h2>
            <IonButton expand="block" routerLink="/login" style={{ marginTop: '1rem' }}>
              Go to Login
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

// --- Styles ---

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'Calibri, sans-serif',
  fontSize: '15px',
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #2e2e2eff',
};

const headerCellStyle: React.CSSProperties = {
  backgroundColor: '#4288eaff',
  borderRight: '1px solid #a0a0a0ff',
  padding: '10px 12px',
  fontWeight: '600',
  color: '#202124',
  textAlign: 'left',
  width: '30%',
};

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #d9d9d9',
  verticalAlign: 'middle',
};

export default Admin_RegisterMember;
