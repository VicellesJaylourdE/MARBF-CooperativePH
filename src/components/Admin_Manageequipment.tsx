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
  unit: "unit";
  quantity: number;
  status: "available" | "maintenance" | "unavailable";
  image_url?: string;
}

const Admin_ManageEquipment: React.FC = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [unit, setUnit] = useState<"unit">("unit");
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<"available" | "maintenance" | "unavailable">("available");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Equipment>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch equipment from Supabase
  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setEquipment(data);
    setLoading(false);
  };

  // Realtime updates
  useEffect(() => {
    fetchEquipment();
    const channel = supabase
      .channel("equipment-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        () => fetchEquipment()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
      const filePath = `equipment-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("equipment-images")
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
          unit,
          quantity,
          status,
          image_url: imageUrl,
        },
      ])
      .select("*");

    if (!error && data) {
      setEquipment([data[0], ...equipment]);
      setName("");
      setCategory("");
      setPrice(null);
      setUnit("unit");
      setQuantity(1);
      setStatus("available");
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setAlertMessage("✅ Equipment added!");
    } else {
      setAlertMessage(`Error adding equipment: ${error?.message}`);
    }

    setShowAlert(true);
    setUploading(false);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm("🗑️ Delete this equipment?")) return;
    await supabase.from("equipment").delete().eq("id", id);
    setEquipment(equipment.filter((eq) => eq.id !== id));
  };

  const handleEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setEditData({ ...eq });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editData.name || !editData.category || !editData.price || editData.quantity === undefined) {
      setAlertMessage("⚠️ Please fill all required fields");
      setShowAlert(true);
      return;
    }

    let imageUrl = editData.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `equipment-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("equipment-images")
          .getPublicUrl(filePath);
        imageUrl = urlData?.publicUrl ?? null;
      }
    }

    await supabase
      .from("equipment")
      .update({
        name: editData.name,
        category: editData.category,
        price: editData.price,
        unit: "unit",
        quantity: editData.quantity,
        status: editData.status,
        image_url: imageUrl,
      })
      .eq("id", id);

    setEquipment(
      equipment.map((eq) => (eq.id === id ? { ...eq, ...editData, image_url: imageUrl } : eq))
    );
    setEditingId(null);
    setEditData({});
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setAlertMessage("✅ Equipment updated!");
    setShowAlert(true);
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
            <IonLabel position="stacked">Price</IonLabel>
            <IonInput
              type="number"
              value={price ?? ""}
              onIonChange={(e) => setPrice(Number(e.detail.value!))}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Quantity</IonLabel>
            <IonInput
              type="number"
              value={quantity}
              onIonChange={(e) => setQuantity(Number(e.detail.value!))}
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

          <IonButton expand="block" color="warning" onClick={handleAddEquipment} disabled={uploading}>
            {uploading ? "Uploading..." : "Add Equipment"}
          </IonButton>
        </IonList>

        <h2 style={{ marginTop: "20px" }}>Equipment List</h2>

        {loading ? (
          <IonSpinner name="dots" />
        ) : (
          <IonGrid className="table-grid">
            <IonRow style={{ fontWeight: "bold", borderBottom: "2px solid #ccc" }}>
              <IonCol>Name</IonCol>
              <IonCol>Category</IonCol>
              <IonCol>Price</IonCol>
              <IonCol>Quantity</IonCol>
              <IonCol>Status</IonCol>
              <IonCol>Image</IonCol>
              <IonCol>Actions</IonCol>
            </IonRow>

            {equipment.map((eq) => (
              <IonRow key={eq.id} style={{ borderBottom: "1px solid #ccc" }}>
                <IonCol>
                  {editingId === eq.id ? (
                    <IonInput
                      value={editData.name}
                      onIonChange={(e) => setEditData({ ...editData, name: e.detail.value! })}
                    />
                  ) : (
                    eq.name
                  )}
                </IonCol>

                <IonCol>
                  {editingId === eq.id ? (
                    <IonInput
                      value={editData.category}
                      onIonChange={(e) => setEditData({ ...editData, category: e.detail.value! })}
                    />
                  ) : (
                    eq.category
                  )}
                </IonCol>

                <IonCol>
                  {editingId === eq.id ? (
                    <IonInput
                      type="number"
                      value={editData.price}
                      onIonChange={(e) =>
                        setEditData({ ...editData, price: Number(e.detail.value!) })
                      }
                    />
                  ) : (
                    `₱${eq.price}`
                  )}
                </IonCol>

                <IonCol>
                  {editingId === eq.id ? (
                    <IonInput
                      type="number"
                      value={editData.quantity}
                      onIonChange={(e) => setEditData({ ...editData, quantity: Number(e.detail.value!) })}
                    />
                  ) : (
                    eq.quantity
                  )}
                </IonCol>

                <IonCol>
                  {editingId === eq.id ? (
                    <IonSelect
                      value={editData.status}
                      onIonChange={(e) => setEditData({ ...editData, status: e.detail.value })}
                    >
                      <IonSelectOption value="available">Available</IonSelectOption>
                      <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
                      <IonSelectOption value="unavailable">Unavailable</IonSelectOption>
                    </IonSelect>
                  ) : (
                    eq.status
                  )}
                </IonCol>

                <IonCol>
                  <IonImg
                    src={eq.image_url || "https://via.placeholder.com/50"}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </IonCol>

                <IonCol>
                  {editingId === eq.id ? (
                    <>
                      <IonButton color="success" size="small" onClick={() => handleSaveEdit(eq.id)}>
                        Save
                      </IonButton>
                      <IonButton color="medium" size="small" onClick={() => setEditingId(null)}>
                        Cancel
                      </IonButton>
                    </>
                  ) : (
                    <>
                      <IonButton color="warning" size="small" onClick={() => handleEdit(eq)}>
                        Edit
                      </IonButton>
                      <IonButton color="danger" size="small" onClick={() => handleDeleteEquipment(eq.id)}>
                        Delete
                      </IonButton>
                    </>
                  )}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        )}

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

export default Admin_ManageEquipment;
