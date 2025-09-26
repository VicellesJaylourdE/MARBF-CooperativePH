import React, { useEffect, useState } from "react";
import { IonContent, IonList, IonItem, IonLabel, IonText } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface User {
  user_id: number;
  username: string;
  user_email: string;
  user_firstname: string | null;
  user_lastname: string | null;
}

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, user_email, user_firstname, user_lastname")
        .eq("role", "user"); // enum filter

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
              <IonLabel>
                <h3>{user.username}</h3>
                <p>{user.user_email}</p>
                <p>{user.user_firstname} {user.user_lastname}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}
    </IonContent>
  );
};

export default UsersTab;
