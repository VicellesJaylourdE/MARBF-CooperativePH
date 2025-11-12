import React, { useEffect, useState, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonButtons,
  IonBackButton, // <-- Naa na ni
  IonInput,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonImg,
  IonText,
  IonInputPasswordToggle,
  IonSpinner,
  IonListHeader, // Added for section headers
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";

const Farmer_MyProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  // 🔹 Fetch logged-in user info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session || !session.user) {
          setAlertMessage("You must be logged in to access this page.");
          setShowAlert(true);
          history.push("/login");
          return;
        }

        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_email", session.user.email)
          .single();

        if (error || !userData) {
          setAlertMessage("User profile not found.");
          setShowAlert(true);
          return;
        }

        setEmail(userData.user_email || "");
        setUsername(userData.username || "");
        setFirstName(userData.user_firstname || "");
        setLastName(userData.user_lastname || "");
        setPhone(userData.user_phone || "");
        setOriginalPhone(userData.user_phone || "");
        setAvatarPreview(userData.user_avatar_url || null);
      } catch (err: any) {
        setAlertMessage("Error loading profile: " + err.message);
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [history]);

  // 🔹 Avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Update user info
  const handleUpdateProfile = async () => {
    try {
      if (!currentPassword) {
        setAlertMessage("Please enter your current password to confirm changes.");
        setShowAlert(true);
        return;
      }

      // Verify current password
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) return;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        setAlertMessage("Incorrect current password.");
        setShowAlert(true);
        return;
      }

      // ✅ Check for duplicate phone numbers
      if (phone && phone !== originalPhone) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("user_id")
          .eq("user_phone", phone)
          .neq("user_email", email)
          .single();

        if (existingUser) {
          setAlertMessage("This phone number is already in use by another account.");
          setShowAlert(true);
          return;
        }
      }

      // Avatar upload
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("user-avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          setAlertMessage(`Avatar upload failed: ${uploadError.message}`);
          setShowAlert(true);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
      }

      // Prepare update data
      const updateData: any = {
        username,
        user_firstname: firstName,
        user_lastname: lastName,
        user_avatar_url: avatarUrl,
      };

      if (phone !== originalPhone) {
        updateData.user_phone = phone;
      }

      // Update users table
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("user_email", user.email);

      if (updateError) {
        setAlertMessage(`Update failed: ${updateError.message}`);
        setShowAlert(true);
        return;
      }

      // Optional: change password
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setAlertMessage("New passwords do not match.");
          setShowAlert(true);
          return;
        }

        const { error: pwError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (pwError) {
          setAlertMessage(`Password update failed: ${pwError.message}`);
          setShowAlert(true);
          return;
        }
      }

      setOriginalPhone(phone); // update cached phone number
      setAlertMessage("✅ Profile updated successfully!");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage("Error: " + error.message);
      setShowAlert(true);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
          <p>Loading profile...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonButtons slot="start">
          {/* 👇 GI-USAB NA NI NGA LINYA PADULONG SA IMONG GUSTO */}
          <IonBackButton defaultHref="/userdashboard" />
        </IonButtons>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonText color="secondary">
          <h1 style={{ marginBottom: "20px" }}>My Profile</h1>
        </IonText>

        <IonGrid style={{ paddingTop: "0" }}>
          
          {/* 🍎 Avatar Section */}
          <IonRow className="ion-justify-content-center ion-margin-bottom">
            <IonCol size="12" className="ion-text-center">
              {avatarPreview && (
                <IonAvatar style={{ width: "150px", height: "150px", margin: "10px auto 15px auto" }}>
                  <IonImg src={avatarPreview} style={{ objectFit: "cover" }} />
                </IonAvatar>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Avatar
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <hr style={{ borderTop: "1px solid var(--ion-color-step-150, #d7d7d7)", margin: "20px 0" }} />
            </IonCol>
          </IonRow>
          
          {/* 📝 Profile Info Section */}
          <IonRow>
            <IonCol size="12">
              <IonListHeader color="light" style={{ paddingLeft: "0", marginBottom: "10px" }}>
                <IonText color="secondary">
                  <h3 style={{ margin: "0" }}>Personal Information</h3>
                </IonText>
              </IonListHeader>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" style={{ marginBottom: "15px" }}>
              <IonInput
                label="Username"
                fill="outline"
                labelPlacement="floating"
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6" style={{ marginBottom: "15px" }}>
              <IonInput
                label="First Name"
                fill="outline"
                labelPlacement="floating"
                value={firstName}
                onIonChange={(e) => setFirstName(e.detail.value!)}
              />
            </IonCol>
            <IonCol size="6" style={{ marginBottom: "15px" }}>
              <IonInput
                label="Last Name"
                fill="outline"
                labelPlacement="floating"
                value={lastName}
                onIonChange={(e) => setLastName(e.detail.value!)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" style={{ marginBottom: "15px" }}>
              <IonInput
                label="Phone Number"
                fill="outline"
                labelPlacement="floating"
                value={phone}
                onIonChange={(e) => setPhone(e.detail.value!)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" style={{ marginBottom: "15px" }}>
              <IonInput
                label="Email"
                fill="outline"
                labelPlacement="floating"
                readonly
                value={email}
              />
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol>
              <hr style={{ borderTop: "1px solid var(--ion-color-step-150, #d7d7d7)", margin: "20px 0" }} />
            </IonCol>
          </IonRow>

          {/* 🔑 Change Password Section */}
          <IonRow>
            <IonCol size="12">
              <IonListHeader color="light" style={{ paddingLeft: "0", marginBottom: "10px" }}>
                <IonText color="secondary">
                  <h3 style={{ margin: "0" }}>Change Password</h3>
                </IonText>
              </IonListHeader>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" style={{ marginBottom: "15px" }}>
              <IonInput
                label="New Password"
                type="password"
                fill="outline"
                labelPlacement="floating"
                value={newPassword}
                onIonChange={(e) => setNewPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
            <IonCol size="12" style={{ marginBottom: "15px" }}>
              <IonInput
                label="Confirm New Password"
                type="password"
                fill="outline"
                labelPlacement="floating"
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol>
              <hr style={{ borderTop: "1px solid var(--ion-color-step-1pre0, #d7d7d7)", margin: "20px 0" }} />
            </IonCol>
          </IonRow>


          {/* 🔒 Confirm Section */}
          <IonRow>
            <IonCol size="12">
              <IonListHeader color="light" style={{ paddingLeft: "0", marginBottom: "10px" }}>
                <IonText color="secondary">
                  <h3 style={{ margin: "0" }}>Confirm Changes (Required)</h3>
                </IonText>
              </IonListHeader>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol style={{ marginBottom: "20px" }}>
              <IonInput
                label="Current Password"
                type="password"
                fill="outline"
                labelPlacement="floating"
                value={currentPassword}
                onIonChange={(e) => setCurrentPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton expand="full" shape="round" onClick={handleUpdateProfile} style={{ marginTop: "10px" }}>
                Save Changes
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Farmer_MyProfile;