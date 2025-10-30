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

const Admin_GenerateReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<string>("bookings");
  const [data, setData] = useState<ReportData[]>([]);

  // OTP states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Logged-in user
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Fetch current user and role
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setCurrentUser(user);
      setEmail(user?.email || "");

      if (user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && userData) {
          setCurrentUserRole(userData.role); // "admin" expected
        }
      }
    };
    getUser();
  }, []);

  // Fetch report data
  useEffect(() => {
    if (!otpVerified || currentUserRole !== "admin") return;

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
            .select("name, category, price, status");
          fetchedData = res.data;
          error = res.error;
        }

        if (error) throw error;

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, username, user_firstname, user_lastname");

        if (usersError) throw usersError;

        const merged = fetchedData?.map((item) => {
          if (!item.user_id) return item;
          const user = usersData?.find((u) => u.id === item.user_id);
          return {
            ...item,
            user_name: user
              ? user.username ||
                `${user.user_firstname || ""} ${user.user_lastname || ""}`.trim()
              : "Unknown User",
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
  }, [reportType, otpVerified, currentUserRole]);

  const calculateDays = (start?: string, end?: string) => {
    if (!start || !end) return "N/A";
    return (
      Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) || 1
    );
  };

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
        row.push(item.name, item.category, item.price, item.status);
      }
      return row;
    });

    const headers = [["#"]];
    if (reportType === "bookings") headers[0].push("Equipment", "User", "Days", "Start Date", "End Date", "Status");
    if (reportType === "transactions") headers[0].push("User", "Amount", "Payment Method", "Status");
    if (reportType === "equipment") headers[0].push("Name", "Category", "Price", "Status");

    autoTable(doc, { startY: 20, head: headers, body: tableData });
    doc.save(`${reportType}_report.pdf`);
  };

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
          row["Status"] = item.status;
        }
        return row;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${reportType}_report.xlsx`);
  };

  // OTP handlers
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

  const handleVerifyOtp = async () => {
    if (!otp) {
      setToastMessage("Please enter OTP.");
      setShowToast(true);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) setToastMessage("OTP verification failed: " + error.message);
    else {
      setToastMessage("OTP verified!");
      setOtpVerified(true);
    }
    setShowToast(true);
  };

  return (
    <IonContent className="ion-padding">
      {/* OTP Section */}
      {!otpVerified && (
        <>
          <IonItem>
            <IonLabel>Email:</IonLabel>
            <IonInput
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              placeholder="Enter your email"
            />
          </IonItem>

          {!otpSent && (
            <IonButton expand="block" onClick={handleSendOtp}>
              Send OTP
            </IonButton>
          )}

          {otpSent && (
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

      {/* Report Section for Admin Only */}
      {otpVerified && currentUserRole === "admin" ? (
        <>
          <IonItem
            style={{
              "--background": "#ffffffff",
              borderRadius: "12px",
              marginBottom: "16px",
              padding: "6px 10px",
            }}
          >
            <IonLabel>Select Report Type</IonLabel>
            <IonSelect
              value={reportType}
              onIonChange={(e) => setReportType(e.detail.value)}
              style={{ color: "#000000ff" }}
            >
              <IonSelectOption value="bookings">Bookings Report</IonSelectOption>
              <IonSelectOption value="transactions">Transactions Report</IonSelectOption>
              <IonSelectOption value="equipment">Equipment Report</IonSelectOption>
            </IonSelect>
          </IonItem>

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
                <thead style={{ backgroundColor: "#ffffffff" }}>
                  <tr>
                    <th style={headerStyle}>#</th>
                    {reportType === "bookings" && <th style={headerStyle}>Equipment</th>}
                    <th style={headerStyle}>User</th>
                    {reportType === "bookings" && <th style={headerStyle}>Days</th>}
                    {reportType === "bookings" && <th style={headerStyle}>Start Date</th>}
                    {reportType === "bookings" && <th style={headerStyle}>End Date</th>}
                    {reportType === "equipment" && <th style={headerStyle}>Category</th>}
                    {reportType === "equipment" && <th style={headerStyle}>Price</th>}
                    {reportType === "transactions" && <th style={headerStyle}>Amount</th>}
                    {reportType === "transactions" && <th style={headerStyle}>Payment Method</th>}
                    <th style={headerStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={item.id || index}
                      style={{ backgroundColor: index % 2 === 0 ? "#ffffffff" : "#ffffffff" }}
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
      ) : otpVerified && currentUserRole !== "admin" ? (
        <div style={{ textAlign: "center", color: "red", marginTop: "20px" }}>
          ❌ You do not have permission to access this page.
        </div>
      ) : null}

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonContent>
  );
};

export default Admin_GenerateReports;
