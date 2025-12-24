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

    // BAG-ONG FIELDS PARA SA REVENUE REPORT
    revenue_group?: string; 
    total_revenue?: number;
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

// Helper function para sa lista sa tuig
const generateYears = (startYear: number, endYear: number) => {
    const years = [];
    const currentYear = new Date().getFullYear();
    if (currentYear < startYear) years.push(currentYear.toString());
    
    for (let year = startYear; year <= endYear; year++) {
        years.push(year.toString());
    }
    return [...new Set(years)].sort((a, b) => parseInt(a) - parseInt(b));
};
const yearsList = generateYears(2023, new Date().getFullYear() + 5); 

const Admin_GenerateReports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    // IDINAGDAG: 'revenue' isip option
    const [reportType, setReportType] = useState<string>("bookings"); 
    const [data, setData] = useState<ReportData[]>([]);

    // OTP states
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    
    // State para sa role checking
    const [userRole, setUserRole] = useState<string | null>(null); 

    // BAG-ONG STATE PARA SA REVENUE REPORT FILTERS
    const [revenueFilter, setRevenueFilter] = useState<"week" | "month" | "year">("month");
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().getMonth() + 1; // 1-based (1=Jan, 12=Dec)
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); 

    // --- REVENUE REPORT LOGIC ---

    const formatRevenueData = (
        transactions: any[], 
        filterType: "week" | "month" | "year"
    ): ReportData[] => {
        
        // Group ang revenue base sa Equipment Name
        const revenueMap: Record<string, { totalRevenue: number }> = {};
        
        transactions.forEach(t => {
            const equipmentName = t.booking?.equipment_name || "Unknown Equipment";
            const amount = Number(t.amount || 0);

            if (!revenueMap[equipmentName]) {
                revenueMap[equipmentName] = { totalRevenue: 0 };
            }
            revenueMap[equipmentName].totalRevenue += amount;
        });

        // I-convert sa ReportData format
        const periodLabel = filterType.charAt(0).toUpperCase() + filterType.slice(1);

        const calculatedData: ReportData[] = Object.entries(revenueMap).map(([equipmentName, data]) => ({
            equipment_name: equipmentName,
            total_revenue: data.totalRevenue,
            revenue_group: periodLabel,
        }));
        
        // Total Revenue
        const totalRevenue = calculatedData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
        
        // Idugang ang Total Revenue isip katapusang entry
        calculatedData.push({
            equipment_name: "**TOTAL REVENUE**",
            total_revenue: totalRevenue,
            revenue_group: periodLabel,
        });
        
        return calculatedData;
    };

    const fetchRevenueReport = async (filterType: "week" | "month" | "year", year: string, month: number) => {
        try {
            setLoading(true);

            // Kuhaon ang paid transactions ug i-apil ang equipment_name ug start_date
            const { data: transactions, error } = await supabase
                .from("transactions")
                .select("amount, status, created_at, booking:booking_id(equipment_name, start_date)") 
                .eq("status", "paid");
            
            if (error) throw error;

            let filteredTransactions = transactions || [];
            const yearToFilter = parseInt(year);

            // --- FILTERING LOGIC ---
            if (filterType === "week") {
                const now = new Date();
                const startOfWeek = new Date(now); 
                startOfWeek.setDate(now.getDate() - now.getDay()); 
                startOfWeek.setHours(0, 0, 0, 0);
                
                const endOfWeek = new Date(startOfWeek); 
                endOfWeek.setDate(startOfWeek.getDate() + 6); 
                endOfWeek.setHours(23, 59, 59, 999);

                filteredTransactions = filteredTransactions.filter((t: any) => { 
                    const date = new Date(t.created_at); 
                    return date >= startOfWeek && date <= endOfWeek; 
                });

            } else if (filterType === "month") {
                const monthToFilter = month - 1; // 0-based month
                filteredTransactions = filteredTransactions.filter((t: any) => {
                    const bookingDateStr = t.booking?.start_date; 
                    if (!bookingDateStr) return false;
                    const date = new Date(bookingDateStr); 
                    return date.getFullYear() === yearToFilter && date.getMonth() === monthToFilter;
                });

            } else if (filterType === "year") {
                filteredTransactions = filteredTransactions.filter((t: any) => {
                    const bookingDateStr = t.booking?.start_date; 
                    if (!bookingDateStr) return false;
                    const date = new Date(bookingDateStr); 
                    return date.getFullYear() === yearToFilter;
                });
            }
            
            const calculatedData = formatRevenueData(filteredTransactions, filterType);
            setData(calculatedData);

        } catch (err: any) {
            console.error("Error fetching revenue report:", err.message);
        } finally {
            setLoading(false);
        }
    };


    // --- DATA FETCHING (MODIFIED TO INCLUDE ROLE CHECK AND REVENUE) ---
    useEffect(() => {
        if (!otpVerified || userRole !== 'admin') {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                let fetchedData: ReportData[] | null = [];
                let error: any = null;

                if (reportType === "revenue") {
                    await fetchRevenueReport(revenueFilter, selectedYear, selectedMonth);
                    return; // Exit after fetching revenue data
                }
                
                // Existing fetching logic
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
    }, [reportType, otpVerified, userRole, revenueFilter, selectedYear, selectedMonth]); // Updated Dependencies

    const calculateDays = (start?: string, end?: string) => {
        if (!start || !end) return "N/A";
        return (
            Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) || 1
        );
    };

    // --- PDF GENERATION (UPDATED FOR REVENUE) ---
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report (Admin)`, 14, 15);

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
                row.push(item.user_name, `₱${item.amount?.toLocaleString()}`, item.payment_method, item.status);
            } else if (reportType === "equipment") {
                row.push(item.name, item.category, `₱${item.price?.toLocaleString()}`, item.quantity, item.status); 
            } else if (reportType === "revenue") {
                row.push(
                    item.equipment_name?.replace('**', '').replace('**', ''),
                    item.revenue_group,
                    `₱${item.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                );
            }
            return row;
        });

        const headers = [["#"]];
        if (reportType === "bookings") headers[0].push("Equipment", "User", "Days", "Start Date", "End Date", "Status");
        if (reportType === "transactions") headers[0].push("User", "Amount", "Payment Method", "Status");
        if (reportType === "equipment") headers[0].push("Name", "Category", "Price", "Quantity", "Status"); 
        if (reportType === "revenue") headers[0].push("Equipment Name", "Time Group", "Total Revenue");

        autoTable(doc, { 
            startY: 20, 
            head: headers, 
            body: tableData,
            didParseCell: (hookData) => {
                // Formatting para sa Total Revenue row
                if (reportType === 'revenue' && hookData.row.index === tableData.length - 1) {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = [255, 249, 230]; // Light yellow background
                }
            } 
        });
        doc.save(`${reportType}_report_admin.pdf`);
    };

    // --- EXCEL EXPORT (UPDATED FOR REVENUE) ---
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
                } else if (reportType === "revenue") {
                    row["Equipment Name"] = item.equipment_name?.replace('**', '').replace('**', '');
                    row["Time Group"] = item.revenue_group;
                    row["Total Revenue"] = item.total_revenue;
                }
                return row;
            })
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);
        XLSX.writeFile(workbook, `${reportType}_report_admin.xlsx`);
    };

    // --- OTP HANDLERS (Unchanged) ---
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

        // 1. Verify OTP
        const { error: otpError } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });

        if (otpError) {
            setToastMessage("OTP verification failed: " + otpError.message);
            setShowToast(true);
            return;
        }

        // 2. Fetch the user's role from the 'users' table
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

        // 3. Check the role and grant access ONLY TO ADMIN
        const role = userData.role;
        setUserRole(role); 
        
        if (role === 'admin') {
            setToastMessage(`OTP verified! Access granted as ADMIN.`);
            setOtpVerified(true);
        } else {
            // Access Denied: Mag-sign out ug i-reset ang forms
            setToastMessage(`Access Denied. Your role is '${role}'. Only ADMIN can view reports.`);
            await supabase.auth.signOut(); 
            setOtpSent(false); 
            setOtpVerified(false);
        }
        setShowToast(true);
    };

    // --- RENDER ---
    return (
        <IonContent className="ion-padding">
            
            {/* 🔐 OTP/Verification Section */}
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

            {/* 📊 Report Generation Section: Makakita LANG ang 'admin' */}
            {otpVerified && userRole === 'admin' && (
                <>
                    <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, color: "#3880ff" }}>Reports Dashboard ({userRole?.toUpperCase()})</h3>
                        <IonItem
                            style={{
                                borderRadius: "12px",
                                padding: "6px 10px",
                                minWidth: "200px",
                            }}
                        >
                            <IonLabel>Select Report Type</IonLabel>
                            <IonSelect
                                value={reportType}
                                onIonChange={(e) => setReportType(e.detail.value)}
                             
                            >
                                <IonSelectOption value="bookings">Bookings Report</IonSelectOption>
                                <IonSelectOption value="transactions">Transactions Report</IonSelectOption>
                                <IonSelectOption value="equipment">Equipment Report</IonSelectOption>
                                <IonSelectOption value="revenue">Revenue by Equipment</IonSelectOption> 
                            </IonSelect>
                        </IonItem>
                    </div>

                    {/* REVENUE FILTER SECTION */}
                    {reportType === "revenue" && (
                        <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", alignItems: "center" }}>
                            <IonItem style={{ minWidth: "150px" }}>
                                <IonLabel>Group by:</IonLabel>
                                <IonSelect 
                                    value={revenueFilter} 
                                    onIonChange={(e) => setRevenueFilter(e.detail.value)} 
                                    interface="popover"
                                >
                                    <IonSelectOption value="week">Current Week</IonSelectOption>
                                    <IonSelectOption value="month">Month</IonSelectOption>
                                    <IonSelectOption value="year">Year</IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            {(revenueFilter === "month" || revenueFilter === "year") && (
                                <IonItem style={{ minWidth: "150px" }}>
                                    <IonLabel>{revenueFilter === "month" ? "Month:" : "Year:"}</IonLabel>
                                    {revenueFilter === "month" && (
                                        <IonSelect 
                                            value={selectedMonth} 
                                            onIonChange={(e) => setSelectedMonth(Number(e.detail.value))} 
                                            interface="popover"
                                        >
                                            {[...Array(12).keys()].map(i => (
                                                <IonSelectOption key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    )}
                                    <IonSelect 
                                        value={selectedYear} 
                                        onIonChange={(e) => setSelectedYear(e.detail.value)} 
                                        interface="popover"
                                        style={{ display: revenueFilter === "month" ? 'none' : 'block' }} 
                                    >
                                        {yearsList.map((year) => (
                                            <IonSelectOption key={year} value={year}>{year}</IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
                        <IonButton color="primary" onClick={generatePDF} disabled={loading || data.length === 0}>
                            Generate PDF
                        </IonButton>
                        <IonButton color="success" onClick={generateExcel} disabled={loading || data.length === 0}>
                            Export Excel
                        </IonButton>
                    </div>

                    {loading ? (
                        <div className="ion-text-center ion-padding">
                            <IonSpinner name="crescent" />
                        </div>
                    ) : data.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#666" }}>No data found for this period/filter.</div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: reportType === 'revenue' ? "500px" : "900px" }}>
                                <thead>
                                    <tr>
                                        <th style={headerStyle}>#</th>
                                        
                                        {/* Dynamic Headers */}
                                        {reportType === "revenue" && <th style={headerStyle}>Equipment Name</th>}
                                        {reportType === "revenue" && <th style={headerStyle}>Time Group</th>}
                                        {reportType === "revenue" && <th style={headerStyle}>Total Revenue</th>}

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
                                        
                                        {reportType !== "revenue" && <th style={headerStyle}>Status</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                           
                                        >
                                            <td style={cellStyle}>{index + 1}</td>

                                            {/* REVENUE DATA */}
                                            {reportType === "revenue" && (
                                                <>
                                                    <td style={{...cellStyle, textAlign: "left"}}>{item.equipment_name?.replace('**', '').replace('**', '')}</td>
                                                    <td style={cellStyle}>{item.revenue_group}</td>
                                                    <td style={{...cellStyle, color: item.equipment_name === '**TOTAL REVENUE**' ? '#e91e63' : 'green'}}>
                                                        ₱{item.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </>
                                            )}
                                            
                                            {/* STANDARD DATA (if not revenue report) */}
                                            {reportType !== "revenue" && (
                                                <>
                                                    {reportType === "bookings" && <td style={cellStyle}>{item.equipment_name}</td>}
                                                    
                                                    {(reportType === "bookings" || reportType === "transactions") && <td style={cellStyle}>{item.user_name || "-"}</td>} 
                                                    {reportType === "equipment" && <td style={cellStyle}>{item.name || "-"}</td>}

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
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* 🛑 Access Denied Message: Kung Verified pero Dili Admin */}
            {otpVerified && userRole !== 'admin' && (
                <div style={{ padding: "20px", textAlign: "center", border: "1px solid red", borderRadius: "8px", marginTop: "20px" }}>
                    <h3>🚫 Access Denied</h3>
                    <p>Only **Admin** users are authorized to view this page. Your current role is **{userRole?.toUpperCase()}**.</p>
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

export default Admin_GenerateReports;