import { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonAlert,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface Equipment {
  id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  image_url?: string;
}

const Admin_Manageequipment: React.FC = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [status, setStatus] = useState("available");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch equipment list
  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setEquipment([]);
    } else {
      const updatedData = await Promise.all(
        (data ?? []).map(async (eq: Equipment) => {
          if (eq.image_url) {
            try {
              const { data: signedData } = await supabase.storage
                .from("user-avatars")
                .createSignedUrl(eq.image_url.split("/").pop()!, 60);
              eq.image_url = signedData?.signedUrl ?? eq.image_url;
            } catch {}
          }
          return eq;
        })
      );
      setEquipment(updatedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add equipment
  const handleAddEquipment = async () => {
    if (!name || !price || !category) {
      setAlertMessage("⚠️ Please fill all required fields");
      setShowAlert(true);
      return;
    }

    setUploading(true);

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `user-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setAlertMessage(`Image upload failed: ${uploadError.message}`);
        setShowAlert(true);
      } else {
        const { data: urlData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);
        imageUrl = urlData?.publicUrl ?? null;
      }
    }

    const { data, error } = await supabase
      .from("equipment")
      .insert([
        {
          name,
          category,
          price,
          status,
          image_url: imageUrl,
        },
      ])
      .select("*");

    if (error) {
      setAlertMessage(`Error adding equipment: ${error.message}`);
      setShowAlert(true);
    } else {
      setEquipment([...(data as Equipment[]), ...equipment]);
      setName("");
      setCategory("");
      setPrice(null);
      setStatus("available");
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setAlertMessage("✅ Equipment added!");
      setShowAlert(true);
    }

    setUploading(false);
  };

  // Delete equipment
  const handleDeleteEquipment = async (id: string) => {
    const confirmDelete = window.confirm(
      "🗑️ Are you sure you want to delete this equipment?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("equipment").delete().eq("id", id);

    if (error) {
      setAlertMessage(`Error deleting equipment: ${error.message}`);
      setShowAlert(true);
    } else {
      setEquipment(equipment.filter((eq) => eq.id !== id));
      setAlertMessage("✅ Equipment deleted!");
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Equipment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name</IonLabel>
            <IonInput value={name} onIonChange={(e) => setName(e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Category</IonLabel>
            <IonInput value={category} onIonChange={(e) => setCategory(e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Price (₱ per day)</IonLabel>
            <IonInput
              type="number"
              value={price ?? ""}
              onIonChange={(e) => setPrice(Number(e.detail.value!))}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Status</IonLabel>
            <IonSelect value={status} onIonChange={(e) => setStatus(e.detail.value)}>
              <IonSelectOption value="available">Available</IonSelectOption>
              <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
              <IonSelectOption value="unavailable">Unavailable</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Image Upload */}
          <IonItem>
            <IonLabel position="stacked">Upload Image</IonLabel>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageChange}
            />
            <IonButton expand="block" onClick={() => fileInputRef.current?.click()}>
              Upload Image
            </IonButton>
          </IonItem>

          {/* Live Preview */}
          {imagePreview && (
            <IonRow className="ion-justify-content-center ion-align-items-center">
              <IonCol className="ion-text-center">
                <IonImg
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100px", height: "100px", objectFit: "cover", marginTop: "10px" }}
                />
              </IonCol>
            </IonRow>
          )}

          <IonButton expand="block" onClick={handleAddEquipment} disabled={uploading}>
            {uploading ? "Uploading..." : "Add Equipment"}
          </IonButton>
        </IonList>

        {/* Equipment List */}
        <h2 style={{ marginTop: "20px" }}>Equipment List</h2>
        {loading ? (
          <IonSpinner name="dots" />
        ) : (
          <IonGrid className="table-grid">
            <IonRow style={{ fontWeight: "bold", borderBottom: "2px solid #ccc" }}>
              <IonCol>Name</IonCol>
              <IonCol>Category</IonCol>
              <IonCol>Price (₱/day)</IonCol>
              <IonCol>Status</IonCol>
              <IonCol>Image</IonCol>
              <IonCol>Actions</IonCol>
            </IonRow>

            {equipment.map((eq, index) => (
              <IonRow
                key={eq.id}
                style={{
                  borderBottom: "1px solid #b8b8b8ff",
                  backgroundColor: index % 2 === 0 ? "#191919ff" : "#000000ff",
                  alignItems: "center",
                }}
              >
                <IonCol>{eq.name}</IonCol>
                <IonCol>{eq.category}</IonCol>
                <IonCol>₱{eq.price}</IonCol>
                <IonCol>{eq.status}</IonCol>
                <IonCol>
                  <IonImg
                    src={eq.image_url || "https://via.placeholder.com/50"}
                    alt={eq.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </IonCol>
                <IonCol>
                  <IonButton color="danger" size="small" onClick={() => handleDeleteEquipment(eq.id)}>
                    Delete
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        )}

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Admin_Manageequipment;
