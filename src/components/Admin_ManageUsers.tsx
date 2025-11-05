import React, { useEffect, useState } from "react";
import { IonContent, IonButton, IonText, IonAlert, IonIcon } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import { pencil, trash } from "ionicons/icons";

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
  const [searchTerm, setSearchTerm] = useState("");

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
    const { error } = await supabase.from("users").delete().eq("user_id", userToDelete);
    if (!error) setUsers(users.filter((u) => u.user_id !== userToDelete));
    setShowDeleteAlert(false);
  };

  const handleEdit = async (values: any) => {
    if (!editingUser) return;

    const updatedData: any = {
      username: values.username,
      user_email: values.user_email,
      user_firstname: values.user_firstname,
      user_lastname: values.user_lastname,
    };

    if (values.password && values.password.trim() !== "") {
      updatedData.password = values.password;
    }

    const { error } = await supabase
      .from("users")
      .update(updatedData)
      .eq("user_id", editingUser.user_id);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.user_id === editingUser.user_id ? { ...u, ...updatedData } : u))
      );
    } else {
      console.error("Update error:", error.message);
    }

    setShowEditAlert(false);
  };
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.user_firstname || ""} ${user.user_lastname || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <IonContent className="ion-padding">
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem"  }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <IonButton color="warning" style={{ marginLeft: "auto"  }} routerLink="/register" >
          Add User
        </IonButton>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "250px",
          }}
        />
      </div>

      {loading ? (
        <IonText>Loading users...</IonText>
      ) : filteredUsers.length === 0 ? (
        <IonText>No users found.</IonText>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#c78e13ff" }}>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
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
                      fill="clear"
                      size="small"
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditAlert(true);
                      }}
                      style={{
                        marginRight: "0.5rem",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "6px",
                        padding: "4px",
                        minWidth: "36px",
                      }}
                    >
                      <IonIcon icon={pencil} />
                    </IonButton>
                    <IonButton
                      color="danger"
                      fill="clear"
                      size="small"
                      onClick={() => {
                        setUserToDelete(user.user_id);
                        setShowDeleteAlert(true);
                      }}
                      style={{
                        backgroundColor: "#f8d7da",
                        borderRadius: "6px",
                        padding: "4px",
                        minWidth: "36px",
                      }}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <IonAlert
        isOpen={showEditAlert}
        onDidDismiss={() => setShowEditAlert(false)}
        header="Edit User"
        cssClass="edit-user-alert"
        inputs={[
          {
            name: "username",
            type: "text",
            placeholder: "👤 Username",
            value: editingUser?.username || "",
          },
          {
            name: "user_email",
            type: "email",
            placeholder: "📧 Email",
            value: editingUser?.user_email || "",
          },
          {
            name: "user_firstname",
            type: "text",
            placeholder: "🪪 First Name",
            value: editingUser?.user_firstname || "",
          },
          {
            name: "user_lastname",
            type: "text",
            placeholder: "🪪 Last Name",
            value: editingUser?.user_lastname || "",
          },
        ]}
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Save",
            handler: (data) => {
              handleEdit(data);
              return false;
            },
          },
        ]}
      />

      {/* ========== DELETE ALERT ========== */}
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

      <style>{`
        .edit-user-alert .alert-wrapper {
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          font-family: 'Poppins', sans-serif;
        }
        .edit-user-alert .alert-title {
          font-size: 18px;
          font-weight: 600;
          color: #000000ff;
          margin-bottom: 8px;
        }
        .edit-user-alert .alert-input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .edit-user-alert .alert-input {
          border: 1px solid #00000088;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 14px;
          color: #222;
          background: #ffffff;
          transition: 0.2s all;
        }
        .edit-user-alert .alert-input:focus {
          border-color: #787775ff;
          box-shadow: 0 0 3px #fcb53b77;
        }
        .edit-user-alert .alert-input::placeholder {
          color: #555;
          opacity: 0.9;
        }
        .edit-user-alert button.alert-button {
          color: #fcb53b;
          font-weight: 600;
          text-transform: uppercase;
        }
        .edit-user-alert button.alert-button.role-cancel {
          color: #555;
        }
      `}</style>
    </IonContent>
  );
};

// Table styles
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "1px solid #000000ff",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #000000ff",
};

const rowEven: React.CSSProperties = { backgroundColor: "#ffffffff" };
const rowOdd: React.CSSProperties = { backgroundColor: "#ffffffff" };

export default Admin_ManageUsers;
