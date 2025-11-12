import React, { useEffect, useState, useMemo } from "react";
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface User {
  user_id: number;
  username: string;
  user_email: string | null;
  user_phone: string | null;
  user_firstname: string | null;
  user_lastname: string | null;
}

const Staff_UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, user_email, user_phone, user_firstname, user_lastname")
        .eq("role", "user");

      if (error) console.error("Error fetching users:", error.message);
      else if (data) setUsers(data);

      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();
      const matchesUsername = user.username.toLowerCase().includes(search);
      const matchesEmail = user.user_email ? user.user_email.toLowerCase().includes(search) : false;
      const matchesPhone = user.user_phone ? user.user_phone.toLowerCase().includes(search) : false;
      const matchesFullName = `${user.user_firstname || ""} ${user.user_lastname || ""}`.toLowerCase().includes(search);

      return matchesUsername || matchesEmail || matchesPhone || matchesFullName;
    });
  }, [users, searchTerm]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Registered Members (View Only)</h2>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", maxWidth: "300px" }}
          />
        </div>

        <p style={{ fontWeight: 600 }}>Total Users: {filteredUsers.length}</p>
        
        {loading ? (
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="ion-text-center">No users found matching your search.</p>
        ) : (
          <IonGrid style={{ padding: 0 }}>
            <IonRow style={{ fontWeight: "bold", background: "#FCB53B", color: "white", padding: "8px 0" }}>
              <IonCol size="auto" style={{ paddingLeft: '10px' }}>#</IonCol>
              <IonCol sizeXs="5" sizeSm="3">Username</IonCol> 
              <IonCol className="ion-hide-sm-down" sizeSm="2">Email</IonCol>
              <IonCol className="ion-hide-sm-down" sizeSm="2">Phone</IonCol>
              <IonCol sizeXs="auto" sizeSm="4">Full Name</IonCol> 
            </IonRow>

            {filteredUsers.map((user, index) => (
              <IonRow
                key={user.user_id}
                style={{
                  borderBottom: "1px solid #040404ff",
                  padding: "6px 0",
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <IonCol size="auto" style={{ paddingLeft: '10px' }}>{index + 1}</IonCol>
                
                <IonCol sizeXs="5" sizeSm="3">
                  <div style={{ fontWeight: 600 }}>{user.username}</div>
                  
                  <div className="ion-show-sm-down" style={{ fontSize: '0.75em', color: '#666', marginTop: '2px' }}>
                    {user.user_phone || user.user_email || "No contact"}
                  </div>
                </IonCol>

                <IonCol className="ion-hide-sm-down" sizeSm="2">
                  {user.user_email || "-"}
                </IonCol>
               
                <IonCol className="ion-hide-sm-down" sizeSm="2">
                  {user.user_phone || "-"}
                </IonCol>
                
                <IonCol sizeXs="auto" sizeSm="4">
                  {`${user.user_firstname || ""} ${user.user_lastname || ""}`}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Staff_UsersTab;