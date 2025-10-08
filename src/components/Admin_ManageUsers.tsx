import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonButton,
  IonAlert,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface User {
  user_id: number;
  username: string;
  user_email: string;
  user_firstname: string | null;
  user_lastname: string | null;
}

const Admin_ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

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

  // Delete User
  const handleDelete = async () => {
    if (!userToDelete) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userToDelete);

    if (error) {
      console.error("Error deleting user:", error.message);
    } else {
      setUsers(users.filter((u) => u.user_id !== userToDelete));
    }
    setShowDeleteAlert(false);
  };

  // Edit User
  const handleEdit = async (values: any) => {
    if (!editingUser) return;

    const updatedData = {
      username: values[0],
      user_email: values[1],
      user_firstname: values[2],
      user_lastname: values[3],
    };

    const { error } = await supabase
      .from("users")
      .update(updatedData)
      .eq("user_id", editingUser.user_id);

    if (error) {
      console.error("Error updating user:", error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingUser.user_id ? { ...u, ...updatedData } : u
        )
      );
    }
    setShowEditAlert(false);
  };

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
                    {user.user_firstname} {user.user_lastname}
                  </p>
                )}
              </IonLabel>

              <IonButton
                color="primary"
                onClick={() => {
                  setEditingUser(user);
                  setShowEditAlert(true);
                }}
              >
                Edit
              </IonButton>

              <IonButton
                color="danger"
                onClick={() => {
                  setUserToDelete(user.user_id);
                  setShowDeleteAlert(true);
                }}
              >
                Remove
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      )}

      {/* Edit User Alert */}
      <IonAlert
        isOpen={showEditAlert}
        onDidDismiss={() => setShowEditAlert(false)}
        header="Edit User"
        inputs={[
          {
            name: "username",
            type: "text",
            placeholder: "Username",
            value: editingUser?.username || "",
          },
          {
            name: "user_email",
            type: "email",
            placeholder: "Email",
            value: editingUser?.user_email || "",
          },
          {
            name: "user_firstname",
            type: "text",
            placeholder: "First Name",
            value: editingUser?.user_firstname || "",
          },
          {
            name: "user_lastname",
            type: "text",
            placeholder: "Last Name",
            value: editingUser?.user_lastname || "",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Save",
            handler: handleEdit,
          },
        ]}
      />

      {/* Delete Confirmation Alert */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirm Delete"
        message="Are you sure you want to remove this user?"
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Delete",
            handler: handleDelete,
          },
        ]}
      />
    </IonContent>
  );
};

export default Admin_ManageUsers;
