import { useState, useEffect, useRef } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonLabel, IonButton, IonList, IonImg, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption, IonSpinner, IonAlert,
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

  // --- State for Adding New Equipment ---
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<"available" | "maintenance" | "unavailable">("available");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- State for Managing Existing Equipment ---
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Used for both Add and Edit Save
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Equipment>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching ---
  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setEquipment(data);
    setLoading(false);
  };

  // --- Real-time Subscription ---
  useEffect(() => {
    fetchEquipment();
    const channel = supabase
      .channel("equipment-changes-admin")
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

  // --- Image Handlers ---
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- Add Equipment Logic ---
  const handleAddEquipment = async () => {
    if (!name || !price || !category || quantity === null || quantity < 0) {
      setAlertMessage("⚠️ Please fill all required fields correctly (quantity must be >= 0)");
      setShowAlert(true);
      return;
    }

    setUploading(true);
    let imageUrl: string | null = null;
    
    // Automatically set status to 'unavailable' if quantity is 0
    const finalStatus = quantity === 0 ? "unavailable" : status;

    // Image upload logic (omitted error handling for brevity, assumed path is correct)
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `user-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);
        imageUrl = urlData?.publicUrl ?? null;
      }
    }

    const { error } = await supabase
      .from("equipment")
      .insert([
        {
          name, category, price, unit: "unit", quantity, status: finalStatus, image_url: imageUrl,
        },
      ]);

    if (!error) {
      setName(""); setCategory(""); setPrice(null); setQuantity(1); setStatus("available");
      setImageFile(null);  
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setAlertMessage("✅ Equipment added successfully!");
    } else {
      setAlertMessage(`Error adding equipment: ${error?.message}`);
    }

    setShowAlert(true);
    setUploading(false);
    fetchEquipment();  
  };

  // --- Delete Equipment Logic ---
  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm("🗑️ Delete this equipment? This cannot be undone.")) return;
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) {
      setAlertMessage(`Error deleting equipment: ${error.message}`);
      setShowAlert(true);
    }
    fetchEquipment(); 
  };

  // --- Edit Handlers ---
  const handleEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setEditData({ ...eq });
    // This is set to preview the current/existing image or a new one
    setImagePreview(eq.image_url || null); 
    setImageFile(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editData.name || !editData.category || !editData.price || editData.quantity === undefined || editData.quantity < 0) {
      setAlertMessage("⚠️ Please fill all required fields correctly (quantity must be >= 0)");
      setShowAlert(true);
      return;
    }

    setUploading(true);
    let imageUrl = editData.image_url;
    
    // Automatically adjust status if quantity is zero
    const updatedStatus = editData.quantity === 0 ? "unavailable" : editData.status;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `user-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);
        imageUrl = urlData?.publicUrl ?? null;
      }
    }

    const { error } = await supabase
      .from("equipment")
      .update({
        name: editData.name, category: editData.category, price: editData.price, unit: "unit", quantity: editData.quantity, status: updatedStatus, image_url: imageUrl,
      })
      .eq("id", id);

    if (!error) {
      setAlertMessage("✅ Equipment updated!");
    } else {
      setAlertMessage(`Error updating equipment: ${error.message}`);
    }

    setUploading(false);
    setEditingId(null);
    setEditData({});
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setShowAlert(true);
    fetchEquipment();  
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar >
          <IonTitle>⚙️ Manage Equipment</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        
        {/* --- ADD NEW EQUIPMENT FORM --- */}
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Add New Equipment</h3>
          <IonList>
            <IonItem><IonLabel position="stacked">Name</IonLabel><IonInput value={name} onIonChange={(e) => setName(e.detail.value!)} /></IonItem>
            <IonItem><IonLabel position="stacked">Category</IonLabel><IonInput value={category} onIonChange={(e) => setCategory(e.detail.value!)} /></IonItem>
            <IonItem>
              <IonLabel position="stacked">Price (₱/day)</IonLabel>
              <IonInput type="number" value={price ?? ""} onIonChange={(e) => setPrice(Number(e.detail.value!))} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Quantity (Initial Unit)</IonLabel>
              <IonInput type="number" value={quantity} onIonChange={(e) => setQuantity(Number(e.detail.value!))} min="0" />
            </IonItem>
            
            {/* Image Upload for New Equipment */}
            <IonItem>
              <IonLabel position="stacked">Upload Image</IonLabel>
              <input
                type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageChange}
                  />
              <IonButton expand="block" size="small" onClick={() => fileInputRef.current?.click()} style={{marginTop: '10px'}}>
                Choose Image
              </IonButton>
            </IonItem>

            {imagePreview && (
              <IonRow className="ion-justify-content-center ion-align-items-center">
                <IonCol className="ion-text-center">
                  <IonImg src={imagePreview} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", marginTop: "10px", borderRadius: '4px' }}/>
                </IonCol>
              </IonRow>
            )}
            
            <IonButton expand="block" color="warning" onClick={handleAddEquipment} disabled={uploading} style={{marginTop: '20px'}}>
              {uploading ? (
                  <>
                      <IonSpinner name="crescent" color="light" style={{marginRight: '8px'}} /> Uploading...
                  </>
              ) : (
                  "Add Equipment"
              )}
            </IonButton>
          </IonList>
        </div>

        <hr/>
        
        <h3 style={{ marginTop: '20px' }}>Current Inventory ({equipment.length})</h3>

        {/* --- EQUIPMENT LIST / TABLE --- */}
        {loading ? (
          <div className="ion-text-center" style={{padding: '20px'}}>
            <IonSpinner name="dots" /> <p>Loading Equipment...</p>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <IonGrid className="table-grid ion-hide-sm-down">
              <IonRow style={{ fontWeight: "bold", borderBottom: "2px solid #ccc" }}>
                <IonCol size-lg="2" size-md="2">Image</IonCol>
                <IonCol size-lg="3" size-md="3">Name/Category</IonCol>
                <IonCol size-lg="2" size-md="2">Price</IonCol>
                <IonCol size-lg="1" size-md="1">Unit</IonCol>
                <IonCol size-lg="2" size-md="2">Status</IonCol>
                <IonCol size-lg="2" size-md="2">Actions</IonCol>
              </IonRow>

              {equipment.map((eq) => (
                <IonRow key={eq.id} style={{ borderBottom: "1px solid #ccc", alignItems: 'center' }}>
                  <IonCol size-lg="2" size-md="2">
                    <IonImg src={editingId === eq.id && editData.image_url ? editData.image_url : eq.image_url || "https://via.placeholder.com/50"} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: '4px' }}/>
                  </IonCol>

                  <IonCol size-lg="3" size-md="3">
                    {editingId === eq.id ? (
                      <>
                        <IonInput value={editData.name} onIonChange={(e) => setEditData({ ...editData, name: e.detail.value! })} placeholder="Name"/>
                        <IonInput value={editData.category} onIonChange={(e) => setEditData({ ...editData, category: e.detail.value! })} placeholder="Category"/>
                      </>
                    ) : (
                      <div><strong>{eq.name}</strong><p style={{margin: 0, fontSize: '0.8em', color: '#666'}}>{eq.category}</p></div>
                    )}
                  </IonCol>

                  <IonCol size-lg="2" size-md="2">
                    {editingId === eq.id ? (
                      <IonInput type="number" value={editData.price} onIonChange={(e) => setEditData({ ...editData, price: Number(e.detail.value!) })}/>
                    ) : (
                      `₱${eq.price}`
                    )}
                  </IonCol>

                  {/* Quantity/Unit for Desktop View */}
                  <IonCol size-lg="1" size-md="1">
                    {editingId === eq.id ? (
                      <IonInput 
                        type="number" 
                        value={editData.quantity} 
                        onIonChange={(e) => {
                          const newQuantity = Number(e.detail.value!);
                          
                          const newStatus = newQuantity === 0 ? "unavailable" : editData.status;
                          setEditData({ ...editData, quantity: newQuantity, status: newStatus });
                        }} 
                        min="0"
                      />
                    ) : (
                      <strong style={{color: eq.quantity <= 0 ? 'red' : 'green'}}>{eq.quantity}</strong>
                    )}
                  </IonCol>

                  <IonCol size-lg="2" size-md="2">
                    {editingId === eq.id ? (
                      <IonSelect 
                        value={editData.quantity === 0 ? "unavailable" : editData.status} 
                        onIonChange={(e) => setEditData({ ...editData, status: e.detail.value })}
                        disabled={editData.quantity === 0} 
                      >
                        <IonSelectOption value="available">Available</IonSelectOption>
                        <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
                        <IonSelectOption value="unavailable">Unavailable</IonSelectOption>
                      </IonSelect>
                    ) : (
                      
                        <span style={{ color: eq.quantity === 0 ? 'red' : 'inherit' }}>
                          {eq.quantity === 0 ? 'unavailable' : eq.status}
                        </span>
                    )}
                  </IonCol>

                  <IonCol size-lg="2" size-md="2">
                    {editingId === eq.id ? (
                      <>
                        <IonButton color="success" size="small" onClick={() => handleSaveEdit(eq.id)} disabled={uploading}>
                            {uploading ? <IonSpinner name="crescent" color="light" /> : "Save"}
                        </IonButton>
                        <IonButton color="medium" size="small" onClick={handleCancelEdit} style={{marginLeft: '4px'}}>Cancel</IonButton>
                      </>
                    ) : (
                      <>
                        <IonButton color="warning" size="small" onClick={() => handleEdit(eq)}>Edit</IonButton>
                        <IonButton color="danger" size="small" onClick={() => handleDeleteEquipment(eq.id)} style={{marginLeft: '4px'}}>Delete</IonButton>
                      </>
                    )}
                  </IonCol>
                </IonRow>
              ))}
            </IonGrid>

            {/* Mobile View List (FIXED THE INPUT ISSUE HERE) */}
            <IonList className="ion-hide-sm-up">
              {equipment.map((eq) => (
                <IonItem key={eq.id} lines="full" style={{flexWrap: 'wrap', paddingBottom: '10px'}}>
                    <IonRow className="ion-align-items-center" style={{width: '100%'}}>
                        <IonCol size="3">
                            <IonImg src={eq.image_url || "https://via.placeholder.com/50"} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: '4px' }}/>
                        </IonCol>
                        <IonCol size="9">
                            {editingId === eq.id ? (
                                <>
                                    {/* Name Input FIX */}
                                    <IonItem lines="none" style={{paddingTop: '5px'}}>
                                        <IonInput value={editData.name} onIonChange={(e) => setEditData({ ...editData, name: e.detail.value! })} placeholder="Name" label="Name" labelPlacement="stacked"/>
                                    </IonItem>
                                    
                                    {/* Quantity Input FIX (This was the main problem area) */}
                                    <IonItem lines="none" style={{paddingTop: '5px'}}>
                                        <IonInput 
                                            type="number" 
                                            value={editData.quantity} 
                                            onIonChange={(e) => {
                                                const newQuantity = Number(e.detail.value!);
                                                const newStatus = newQuantity === 0 ? "unavailable" : editData.status;
                                                setEditData({ ...editData, quantity: newQuantity, status: newStatus });
                                            }} 
                                            min="0" 
                                            label="Stock"
                                            labelPlacement="stacked" // Makes it clear on mobile
                                        />
                                    </IonItem>
                                    
                                    {/* Status Select FIX */}
                                    <IonItem lines="none" style={{paddingTop: '5px'}}>
                                        <IonSelect 
                                            value={editData.quantity === 0 ? "unavailable" : editData.status} 
                                            onIonChange={(e) => setEditData({ ...editData, status: e.detail.value })} 
                                            label="Status"
                                            labelPlacement="stacked" // Makes it clear on mobile
                                            disabled={editData.quantity === 0} 
                                        >
                                            <IonSelectOption value="available">Available</IonSelectOption>
                                            <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
                                            <IonSelectOption value="unavailable">Unavailable</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </>
                            ) : (
                                <div>
                                    <strong>{eq.name} ({eq.category})</strong> <br/>
                                    <span style={{fontSize: '0.9em'}}>Price: ₱{eq.price} | Unit: <strong style={{color: eq.quantity <= 0 ? 'red' : 'green'}}>{eq.quantity}</strong></span> <br/>
                                    <span style={{fontSize: '0.8em', color: eq.quantity === 0 ? 'red' : '#666'}}>
                                      Status: {eq.quantity === 0 ? 'unavailable' : eq.status}
                                    </span>
                                </div>
                            )}
                        </IonCol>
                        <IonCol size="12" className="ion-text-right" style={{marginTop: editingId === eq.id ? '10px' : '0'}}>
                            {editingId === eq.id ? (
                                <>
                                    <IonButton color="success" size="small" onClick={() => handleSaveEdit(eq.id)} disabled={uploading}>
                                        {uploading ? <IonSpinner name="crescent" color="light" /> : "Save"}
                                    </IonButton>
                                    <IonButton color="medium" size="small" onClick={handleCancelEdit} style={{marginLeft: '4px'}}>Cancel</IonButton>
                                </>
                            ) : (
                                <>
                                    <IonButton color="warning" size="small" onClick={() => handleEdit(eq)}>Edit</IonButton>
                                    <IonButton color="danger" size="small" onClick={() => handleDeleteEquipment(eq.id)} style={{marginLeft: '4px'}}>Delete</IonButton>
                                </>
                            )}
                        </IonCol>
                    </IonRow>
                </IonItem>
              ))}
            </IonList>
          </>
        )}

        <IonAlert isOpen={showAlert} onDidDismiss={() => setShowAlert(false)} message={alertMessage} buttons={["OK"]}/>
      </IonContent>
    </IonPage>
  );
};

export default Admin_ManageEquipment;