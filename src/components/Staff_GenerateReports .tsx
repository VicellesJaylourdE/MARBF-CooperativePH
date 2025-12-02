import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonToast,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportData {
  id?: string;
  user_id?: number;
  equipment_name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  name?: string;
  amount?: number;
  payment_method?: string;
  created_at?: string;
  category?: string;
  price?: number;
  unit?: "unit"; 
  quantity?: number;
  user_name?: string;
}

const headerStyle: React.CSSProperties = {
  padding: "10px",
  fontWeight: 600,
  fontSize: "0.95rem",
  borderBottom: "1px solid #ddd",
  textAlign: "center",
};

const cellStyle: React.CSSProperties = {
  padding: "8px",
  fontSize: "0.9rem",
  borderBottom: "1px solid #eee",
  textAlign: "center",
};

const Staff_GenerateReports : React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<string>("bookings");
  const [data, setData] = useState<ReportData[]>([]);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // State para sa role checking

  // --- DATA FETCHING (MODIFIED TO INCLUDE ROLE CHECK) ---
  useEffect(() => {
    // I-check kung Staff role lang ang naka-verified
    if (!otpVerified || userRole !== 'staff') {
        setLoading(false);
        return;
    } 

    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedData: ReportData[] | null = [];
        let error: any = null;

        if (reportType === "bookings") {
          const res = await supabase
            .from("bookings")
            .select("id, user_id, equipment_name, start_date, end_date, status");
          fetchedData = res.data;
          error = res.error;
        } else if (reportType === "transactions") {
          const res = await supabase
            .from("transactions")
            .select("id, user_id, amount, status, payment_method, created_at");
          fetchedData = res.data;
          error = res.error;
        } else if (reportType === "equipment") {
          const res = await supabase
            .from("equipment")
            .select("name, category, price, status, quantity"); 
          fetchedData = res.data;
          error = res.error;
        }

        if (error) throw error;

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("user_id, username, user_firstname, user_lastname");

        if (usersError) throw usersError;

        const merged = fetchedData?.map((item) => {
          if (reportType !== "equipment" && !item.user_id) return item;

          const user = usersData?.find((u) => u.user_id === item.user_id);
          
          let finalStatus = item.status;
          if (reportType === "equipment" && item.quantity !== undefined) {
            finalStatus = item.quantity === 0 ? "unavailable" : item.status;
          }

          return {
            ...item,
            user_name: user
              ? user.username ||
                `${user.user_firstname || ""} ${user.user_lastname || ""}`.trim()
              : reportType === "equipment" ? item.name : "Unknown User", 
            status: finalStatus, 
          };
        });

        setData(merged || []);
      } catch (err: any) {
        console.error("Error fetching report:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType, otpVerified, userRole]);

  // --- HELPER FUNCTION ---
  const calculateDays = (start?: string, end?: string) => {
    if (!start || !end) return "N/A";
    return (
      Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) || 1
    );
  };

  // --- PDF GENERATION ---
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 14, 15);

    const tableData = data.map((item, index) => {
      const row: any[] = [index + 1];
      if (reportType === "bookings") {
        row.push(
          item.equipment_name,
          item.user_name,
          calculateDays(item.start_date, item.end_date),
          item.start_date,
          item.end_date,
          item.status
        );
      } else if (reportType === "transactions") {
        row.push(item.user_name, item.amount, item.payment_method, item.status);
      } else if (reportType === "equipment") {
        row.push(item.name, item.category, item.price, item.quantity, item.status); 
      }
      return row;
    });

    const headers = [["#"]];
    if (reportType === "bookings") headers[0].push("Equipment", "User", "Days", "Start Date", "End Date", "Status");
    if (reportType === "transactions") headers[0].push("User", "Amount", "Payment Method", "Status");
    if (reportType === "equipment") headers[0].push("Name", "Category", "Price", "Quantity", "Status"); 

    autoTable(doc, { startY: 20, head: headers, body: tableData });
    doc.save(`${reportType}_report.pdf`);
  };

  // --- EXCEL EXPORT ---
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item, index) => {
        const row: any = { "#": index + 1 };
        if (reportType === "bookings") {
          row["Equipment"] = item.equipment_name;
          row["User"] = item.user_name;
          row["Days"] = calculateDays(item.start_date, item.end_date);
          row["Start Date"] = item.start_date;
          row["End Date"] = item.end_date;
          row["Status"] = item.status;
        } else if (reportType === "transactions") {
          row["User"] = item.user_name;
          row["Amount"] = item.amount;
          row["Payment Method"] = item.payment_method;
          row["Status"] = item.status;
        } else if (reportType === "equipment") {
          row["Name"] = item.name;
          row["Category"] = item.category;
          row["Price"] = item.price;
          row["Quantity"] = item.quantity;
          row["Status"] = item.status;
        }
        return row;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${reportType}_report.xlsx`);
  };

  // --- OTP HANDLERS ---
  const handleSendOtp = async () => {
    if (!email) {
      setToastMessage("Please enter your email.");
      setShowToast(true);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setToastMessage("Failed to send OTP: " + error.message);
    else {
      setToastMessage("OTP sent! Check your email.");
      setOtpSent(true);
    }
    setShowToast(true);
  };

  // 🔥 CORE LOGIC: Verify OTP and Check for 'staff' Role
  const handleVerifyOtp = async () => {
    if (!otp) {
        setToastMessage("Please enter OTP.");
        setShowToast(true);
        return;
    }

    // 1. Verify OTP
    const { error: otpError } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });

    if (otpError) {
        setToastMessage("OTP verification failed: " + otpError.message);
        setShowToast(true);
        return;
    }

    // 2. Fetch the user's role from the 'users' table using the email
    const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("user_email", email)
        .single();

    if (roleError || !userData) {
        setToastMessage("User role not found. Access denied.");
        setShowToast(true);
        return;
    }

    // 3. Check the role and grant access ONLY TO STAFF
    const role = userData.role;
    setUserRole(role); 
    
    if (role === 'staff') {
        setToastMessage(`OTP verified! Access granted as STAFF.`);
        setOtpVerified(true);
    } else {
        // Access Denied: Mag-sign out ug i-reset ang forms
        setToastMessage(`Access Denied. Your role is '${role}'. Only STAFF can view reports.`);
        await supabase.auth.signOut(); 
        setOtpSent(false); 
        setOtpVerified(false);
    }

    setShowToast(true);
  };

  // --- RENDER ---
  return (
    <IonContent className="ion-padding">
      
      {/* 🔐 OTP/Verification Section: Makakita ni tanan */}
      {!otpVerified && (
        <>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              placeholder="Enter your email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>

          {!otpSent && (
            <IonButton expand="block" color="warning" onClick={handleSendOtp}>
              Send OTP
            </IonButton>
          )}

          {otpSent && !otpVerified && (
            <>
              <IonItem>
                <IonLabel position="stacked">Enter OTP</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onIonChange={(e) => setOtp(e.detail.value!)}
                />
              </IonItem>
              <IonButton expand="block" onClick={handleVerifyOtp}>
                Verify OTP
              </IonButton>
            </>
          )}
        </>
      )}

      {/* 📊 Report Generation Section: Makakita LANG ang 'staff' */}
      {otpVerified && userRole === 'staff' && (
        <>
          <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#3880ff" }}>Reports Dashboard ({userRole?.toUpperCase()})</h3>
              <IonItem 
                style={{
                  borderRadius: "12px",
                  padding: "6px 10px",
                  minWidth: "200px"
                }}
              >
                <IonLabel>Select Report Type</IonLabel>
                <IonSelect
                  value={reportType}
                  onIonChange={(e) => setReportType(e.detail.value)}
                  style={{ color: "#fffafaff" }}
                >
                  <IonSelectOption value="bookings">Bookings Report</IonSelectOption>
                  <IonSelectOption value="transactions">Transactions Report</IonSelectOption>
                  <IonSelectOption value="equipment">Equipment Report</IonSelectOption>
                </IonSelect>
              </IonItem>
          </div>

          <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
            <IonButton color="primary" onClick={generatePDF}>
              Generate PDF
            </IonButton>
            <IonButton color="success" onClick={generateExcel}>
              Export Excel
            </IonButton>
          </div>

          {loading ? (
            <div className="ion-text-center ion-padding">
              <IonSpinner name="crescent" />
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: "center", color: "#666" }}>No data found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr>
                    <th style={headerStyle}>#</th>
                    {reportType === "bookings" && <th style={headerStyle}>Equipment</th>}
                    {reportType === "equipment" && <th style={headerStyle}>Name</th>}
                    {(reportType === "transactions" || reportType === "bookings") && <th style={headerStyle}>User</th>}

                    {reportType === "bookings" && <th style={headerStyle}>Days</th>}
                    {reportType === "bookings" && <th style={headerStyle}>Start Date</th>}
                    {reportType === "bookings" && <th style={headerStyle}>End Date</th>}
                    {reportType === "equipment" && <th style={headerStyle}>Category</th>}
                    {reportType === "equipment" && <th style={headerStyle}>Price</th>}
                    {reportType === "equipment" && <th style={headerStyle}>Quantity</th>} 
                    {reportType === "transactions" && <th style={headerStyle}>Amount</th>}
                    {reportType === "transactions" && <th style={headerStyle}>Payment Method</th>}
                    <th style={headerStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={item.id || index}
                    >
                      <td style={cellStyle}>{index + 1}</td>
                      {reportType === "bookings" && <td style={cellStyle}>{item.equipment_name}</td>}
                      
                      <td style={cellStyle}>{item.user_name || item.name || "-"}</td> 
                      
                      {reportType === "bookings" && (
                        <>
                          <td style={cellStyle}>{calculateDays(item.start_date, item.end_date)}</td>
                          <td style={cellStyle}>{item.start_date}</td>
                          <td style={cellStyle}>{item.end_date}</td>
                        </>
                      )}
                      {reportType === "equipment" && (
                        <>
                          <td style={cellStyle}>{item.category}</td>
                          <td style={cellStyle}>{item.price ? `₱${item.price.toLocaleString()}` : "-"}</td>
                          <td style={cellStyle}>
                            <strong style={{color: item.quantity === 0 ? 'red' : 'green'}}>
                                {item.quantity !== undefined ? item.quantity : "-"}
                            </strong>
                          </td>
                        </>
                      )}
                      {reportType === "transactions" && (
                        <>
                          <td style={cellStyle}>{item.amount ? `₱${item.amount.toLocaleString()}` : "-"}</td>
                          <td style={cellStyle}>{item.payment_method}</td>
                        </>
                      )}
                      <td style={cellStyle}>{item.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 🛑 Access Denied Message: Makakita ni kung Verified pero Dili Staff */}
      {otpVerified && userRole !== 'staff' && (
          <div style={{ padding: "20px", textAlign: "center", border: "1px solid red", borderRadius: "8px", marginTop: "20px" }}>
              <h3>🚫 Access Denied</h3>
              <p>Only **Staff** users are authorized to view this page. Your current role is **{userRole?.toUpperCase()}**.</p>
              <IonButton 
                  onClick={() => { 
                      setOtpVerified(false); 
                      setOtpSent(false); 
                      setOtp(''); 
                      setEmail(''); 
                      setUserRole(null); 
                  }} 
                  color="danger" 
                  fill="outline"
              >
                  Try Another Email
              </IonButton>
          </div>
      )}


      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonContent>
  );
};

export default Staff_GenerateReports ;