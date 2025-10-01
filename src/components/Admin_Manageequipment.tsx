import { useState, useEffect } from "react";
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
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonSpinner,
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
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch existing equipment
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
      setEquipment((data ?? []) as Equipment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // ✅ Add equipment
  const handleAddEquipment = async () => {
    if (!name || !price || !category) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    let imageUrl: string | null = null;

    // Upload image to Supabase Storage
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Image upload failed:", uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("equipment-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    // Insert into equipment table
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
      console.error("Error adding equipment:", error.message);
    } else {
      alert("✅ Equipment added!");
      setEquipment([...(data as Equipment[]), ...equipment]);
      setName("");
      setCategory("");
      setPrice(null);
      setImageFile(null);
      setStatus("available");
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

        {/* Add Form */}
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name</IonLabel>
            <IonInput
              value={name}
              onIonChange={(e) => setName(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Category</IonLabel>
            <IonInput
              value={category}
              onIonChange={(e) => setCategory(e.detail.value!)}
            />
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
            <IonSelect
              value={status}
              onIonChange={(e) => setStatus(e.detail.value)}
            >
              <IonSelectOption value="available">Available</IonSelectOption>
              <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
              <IonSelectOption value="unavailable">Unavailable</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Upload Image</IonLabel>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </IonItem>

          <IonButton expand="block" onClick={handleAddEquipment}>
            Add Equipment
          </IonButton>
        </IonList>

        <h2 style={{ marginTop: "20px" }}>Equipment List</h2>

        {loading ? (
          <IonSpinner name="dots" />
        ) : (
          <IonGrid>
            <IonRow>
              {equipment.map((eq) => (
                <IonCol size="6" sizeMd="4" key={eq.id}>
                  <IonCard>
                    <IonImg
                      src={eq.image_url || "https://via.placeholder.com/150"}
                      alt={eq.name}
                    />
                    <IonCardContent>
                      <h3>{eq.name}</h3>
                      <p>{eq.category}</p>
                      <p><strong>₱{eq.price}</strong> / day</p>
                      <p>Status: {eq.status}</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Admin_Manageequipment;
