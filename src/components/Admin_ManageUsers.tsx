import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonButton,
  IonText,
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

  const handleDelete = async () => {
    if (!userToDelete) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userToDelete);

    if (!error) setUsers(users.filter((u) => u.user_id !== userToDelete));
    setShowDeleteAlert(false);
  };

  const handleEdit = async (values: any) => {
    if (!editingUser) return;

    // Fix: IonAlert returns object, not array
    const updatedData = {
      username: values.username,
      user_email: values.user_email,
      user_firstname: values.user_firstname,
      user_lastname: values.user_lastname,
    };

    const { error } = await supabase
      .from("users")
      .update(updatedData)
      .eq("user_id", editingUser.user_id);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingUser.user_id ? { ...u, ...updatedData } : u
        )
      );
    } else {
      console.error("Update error:", error.message);
    }

    setShowEditAlert(false);
  };

  return (
    <IonContent className="ion-padding">
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <IonButton
          color="primary"
          style={{ marginLeft: "auto" }}
          routerLink="/register"
        >
          Add Member
        </IonButton>
      </div>

      {loading ? (
        <IonText>Loading users...</IonText>
      ) : users.length === 0 ? (
        <IonText>No users found.</IonText>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#000000ff" }}>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.user_id} style={index % 2 === 0 ? rowEven : rowOdd}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{user.username}</td>
                  <td style={tdStyle}>{user.user_email}</td>
                  <td style={tdStyle}>
                    {user.user_firstname || ""} {user.user_lastname || ""}
                  </td>
                  <td style={tdStyle}>
                    <IonButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditAlert(true);
                      }}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Edit
                    </IonButton>
                    <IonButton
                      color="danger"
                      size="small"
                      onClick={() => {
                        setUserToDelete(user.user_id);
                        setShowDeleteAlert(true);
                      }}
                    >
                      Remove
                    </IonButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Alert */}
      <IonAlert
        isOpen={showEditAlert}
        onDidDismiss={() => setShowEditAlert(false)}
        header="Edit User"
        inputs={[
          { name: "username", type: "text", placeholder: "Username", value: editingUser?.username || "" },
          { name: "user_email", type: "email", placeholder: "Email", value: editingUser?.user_email || "" },
          { name: "user_firstname", type: "text", placeholder: "First Name", value: editingUser?.user_firstname || "" },
          { name: "user_lastname", type: "text", placeholder: "Last Name", value: editingUser?.user_lastname || "" },
        ]}
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Save",
            handler: (data) => {
              handleEdit(data);
              return false; // prevents auto-close until handler finishes
            },
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
          { text: "Cancel", role: "cancel" },
          { text: "Delete", handler: handleDelete },
        ]}
      />
    </IonContent>
  );
};

// Styles for Excel-style table
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "1px solid #000000ff",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #000000ff",
};

const rowEven: React.CSSProperties = { backgroundColor: "#000000ff" };
const rowOdd: React.CSSProperties = { backgroundColor: "#000000ff" };

export default Admin_ManageUsers;
