import React, { useEffect, useState, useMemo } from "react";
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonButton, IonAlert, IonIcon, IonSpinner } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import { pencil, trash } from "ionicons/icons";

interface User {
  user_id: number;
  username: string;
  user_email: string | null;
  user_phone: string | null;
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
        .select("user_id, username, user_email, user_phone, user_firstname, user_lastname")
        .eq("role", "user");

      if (error) console.error("Error fetching users:", error.message);
      else if (data) setUsers(data);

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
    if ((!values.user_email || values.user_email.trim() === "") && (!values.user_phone || values.user_phone.trim() === "")) {
      alert("Please enter at least an Email or Phone.");
      return false;
    }

    const updatedData: any = {
      username: values.username,
      user_email: values.user_email || null,
      user_phone: values.user_phone || null,
      user_firstname: values.user_firstname,
      user_lastname: values.user_lastname,
    };

    const { error } = await supabase
      .from("users")
      .update(updatedData)
      .eq("user_id", editingUser.user_id);

    if (!error) setUsers((prev) => prev.map((u) => (u.user_id === editingUser.user_id ? { ...u, ...updatedData } : u)));
    else console.error("Update error:", error.message);

    setShowEditAlert(false);
  };

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
          <h2 style={{ margin: 0 }}>User</h2>
          <IonButton color="warning" style={{ marginLeft: "auto" }} routerLink="/register">
            Add Users
          </IonButton>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", maxWidth: "300px" }}
          />
        </div>

        <p style={{ fontWeight: 600 }}>Total Users: {filteredUsers.length}</p>
        
        {/* --- LOADING AND EMPTY STATE --- */}
        {loading ? (
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="ion-text-center">No users found.</p>
        ) : (
          /* --- SINGLE RESPONSIVE ION GRID --- */
          <IonGrid>
            {/* Header Row: Hide Email/Phone/Full Name on small screens (mobile) */}
            <IonRow style={{ fontWeight: "bold", background: "#FCB53B", color: "white", padding: "8px 0" }}>
              <IonCol size="auto">#</IonCol>
              <IonCol sizeXs="5" sizeSm="2">Username</IonCol> {/* Give Username more space on mobile */}
              <IonCol className="ion-hide-sm-down" sizeSm="2">Email</IonCol>
              <IonCol className="ion-hide-sm-down" sizeSm="2">Phone</IonCol>
              <IonCol className="ion-hide-sm-down" sizeSm="3">Full Name</IonCol>
              <IonCol size="auto">Actions</IonCol>
            </IonRow>

            {filteredUsers.map((user, index) => (
              <IonRow
                key={user.user_id}
                style={{
                  borderBottom: "1px solid #040404ff",
                  padding: "6px 0",
                  // Add a hover effect for better UX
                  transition: 'background-color 0.2s',
                }}
                // You can add a CSS class or inline style for hover:
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <IonCol size="auto">{index + 1}</IonCol>
                
                {/* Username Column (Visible on all screens) */}
                <IonCol sizeXs="5" sizeSm="2">
                  <div style={{ fontWeight: 600 }}>{user.username}</div>
                  {/* Secondary info stacking for mobile (optional, but avoids double data) */}
                  <div className="ion-show-sm-down" style={{ fontSize: '0.75em', color: '#666' }}>
                    {/* Show Full Name on mobile when other columns are hidden */}
                    {`${user.user_firstname || ""} ${user.user_lastname || ""}`}
                  </div>
                </IonCol>

                {/* Email (Hidden on mobile) */}
                <IonCol className="ion-hide-sm-down" sizeSm="2">
                  {user.user_email || "-"}
                </IonCol>
                
                {/* Phone (Hidden on mobile) */}
                <IonCol className="ion-hide-sm-down" sizeSm="2">
                  {user.user_phone || "-"}
                </IonCol>
                
                {/* Full Name (Hidden on mobile) */}
                <IonCol className="ion-hide-sm-down" sizeSm="3">
                  {`${user.user_firstname || ""} ${user.user_lastname || ""}`}
                </IonCol>
                
                <IonCol size="auto">
                  <IonButton fill="clear" size="small" onClick={() => { setEditingUser(user); setShowEditAlert(true); }}>
                    <IonIcon icon={pencil} />
                  </IonButton>
                  <IonButton fill="clear" size="small" color="danger" onClick={() => { setUserToDelete(user.user_id); setShowDeleteAlert(true); }}>
                    <IonIcon icon={trash} />
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        )}
        <IonAlert
          isOpen={showEditAlert}
          onDidDismiss={() => setShowEditAlert(false)}
          header="Edit User"
          inputs={[
            { name: "username", type: "text", placeholder: "Username", value: editingUser?.username || "" },
            { name: "user_email", type: "email", placeholder: "Email", value: editingUser?.user_email || "" },
            { name: "user_phone", type: "text", placeholder: "Phone", value: editingUser?.user_phone || "" },
            { name: "user_firstname", type: "text", placeholder: "First Name", value: editingUser?.user_firstname || "" },
            { name: "user_lastname", type: "text", placeholder: "Last Name", value: editingUser?.user_lastname || "" },
          ]}
          buttons={[
            { text: "Cancel", role: "cancel" },
            { 
              text: "Save", 
              handler: (data) => { 
                return handleEdit(data); 
              } 
            },
          ]}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message={`Are you sure you want to remove user "${users.find(u => u.user_id === userToDelete)?.username || 'this user'}"?`}
          buttons={[{ text: "Cancel", role: "cancel" }, { text: "Delete", handler: handleDelete }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Admin_ManageUsers;