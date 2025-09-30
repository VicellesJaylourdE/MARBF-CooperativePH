import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface User {
  user_id: number;
  username: string;
  user_email: string;
  user_firstname: string | null;
  user_lastname: string | null;
}

const Admin_UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, user_email, user_firstname, user_lastname")
        .eq("role", "user");
      if (error) {
        console.error("Error fetching users:", error.message);
      } else if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <IonContent className="ion-padding">
      <h2>Users</h2>
      {loading ? (
        <IonText>Loading users...</IonText>
      ) : users.length === 0 ? (
        <IonText>No users found.</IonText>
      ) : (
        <IonList>
          {users.map((user) => (
            <IonItem key={user.user_id}>
              <IonAvatar slot="start">
                <div
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontWeight: "bold",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </IonAvatar>
              <IonLabel>
                <h3>{user.username}</h3>
                <p>{user.user_email}</p>
                {(user.user_firstname || user.user_lastname) && (
                  <p>
                  </p>
                )}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}
    </IonContent>
  );
};

export default Admin_UsersTab;
