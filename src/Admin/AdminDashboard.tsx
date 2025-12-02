import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonButton,
} from "@ionic/react";

import { supabase } from "../utils/supabaseClient";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Admin_GenerateReports from "../components/Admin_GenerateReports";
import Staff_BookingsTab from "../components/Staff_ViewBookingCalendar";
import Admin_Manageequipment from "../components/Admin_Manageequipment";
import Admin_ViewBookingCalendar from "../components/Admin_ViewBookingCalendar";
import Admin_ManageRentalBookings from "../components/Admin_ManageRentalBookings";
import Admin_ViewAllTransactions from "../components/Admin_ViewAllTransactions";
import Admin_ManageUsers from "../components/Admin_ManageUsers";
import Admin_RegisterMember from "../components/Admin_RegisterMember";
import Admin_Myprofile from "../components/Admin_MyProfile";

import Admin_AdminHeaderBar from "../components/Admin_AdminHeaderBar";
import Admin_AdminSidebar from "../components/Admin_AdminSidebar";

// --- START: Support Functions (Gipagawas aron dili mag-recreate kada render) ---

const DashboardStyles: React.FC = () => (
  <style>{`
    .active-sidebar-item {
      --background: rgba(var(--ion-color-primary-rgb), 0.1);
      --color: var(--ion-color-primary);
      border-radius: 8px;
      margin-left: 8px;
      margin-right: 8px;
      width: auto;
    }

    .active-sidebar-item ion-icon {
      color: var(--ion-color-primary);
    }
  
    ion-card {
      box-shadow: none !important;
      --border-width: 0px !important;
    }

    ion-card-header {
      --border-width: 0px !important;
    }

    ion-card-header ion-item {
      --background: transparent;
      --inner-border-width: 0px;
    }
  `}</style>
);

const colorPalette = ["#36a2eb", "#4caf50", "#ff9800", "#f39c12", "#9b59b6", "#e74c3c", "#2ecc71"];

// ⭐️ UPDATED FUNCTION: Mag-generate sa mga tuig (e.g., 2025 - 2090)
const generateYears = (startYear: number, endYear: number) => {
  const years = [];
  const currentYear = new Date().getFullYear();
  if (currentYear < startYear) years.push(currentYear.toString());
  
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }
  return [...new Set(years)].sort((a, b) => parseInt(a) - parseInt(b)); // Filter unique and sort
};

// ⭐️ NEW FUNCTION: Magkuha sa week number sulod sa bulan (Week 1 - 5)
const getWeekOfMonth = (date: Date): number => {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = date.getDate();
    // Simple approximation based on day of month, adjusted by the starting day of the month
    // This is typically sufficient for chart visualization grouping
    return Math.ceil((day + firstOfMonth.getDay()) / 7); 
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


// --- END: Support Functions ---


const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  
  // ⭐️ KAUSABAN 1: Bag-ong filter type nga 'month-weeks'
  const [filter, setFilter] = useState<"week" | "month" | "year" | "month-weeks">("month"); 

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear); 
  
  // ⭐️ KAUSABAN 2: Bag-ong state para sa gipili nga bulan
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0 = Jan, 1 = Feb, etc.

  const [topEquipments, setTopEquipments] = useState<any[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [equipmentCountData, setEquipmentCountData] = useState<any[]>([]);
  const [loadingEquipmentCount, setLoadingEquipmentCount] = useState(true);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // ⭐️ KAUSABAN 3: Pag-generate sa lista sa tuig (2025 hangtod 2090)
  const yearsList = generateYears(2025, 2090);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: equipmentCount } = await supabase.from("equipment").select("*", { count: "exact", head: true });
        setTotalEquipment(equipmentCount || 0);
        
        const today = new Date().toISOString().split("T")[0];
        const { count: todayApprovedCount } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "approved").gte("approved_at", `${today}T00:00:00`).lte("approved_at", `${today}T23:59:59`);
        setTodayBookings(todayApprovedCount || 0);
        
        const { count: totalBookingsCount } = await supabase.from("bookings").select("*", { count: "exact", head: true });
        setTotalBookings(totalBookingsCount || 0);
        
        const { data: approvedBookings } = await supabase.from("bookings").select("id").eq("status", "approved");
        const approvedBookingIds = approvedBookings?.map((b) => b.id) || [];
        
        let revenueSum = 0;
        if (approvedBookingIds.length > 0) {
          const { data: revenueData } = await supabase.from("transactions").select("amount, booking_id").in("booking_id", approvedBookingIds);
          if (revenueData && revenueData.length > 0) {
            revenueSum = revenueData.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
          }
        }
        setTotalRevenue(revenueSum);
        
        const { count: pendingCount } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");
        setPendingBookings(pendingCount || 0);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    // 2. Fetch Analytics (Charts) - GI-USAB NGA LOGIC
    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        
        // Get all paid transactions ug i-apil ang 'start_date' gikan sa bookings
        const { data: transactions } = await supabase
          .from("transactions")
          .select("id, amount, status, paid_at, booking:booking_id(equipment_name, start_date)") 
          .eq("status", "paid");

        const now = new Date();
        
        let formattedData: any[] = [];
        let filteredTransactions = transactions || [];

        if (filter === "year" || filter === "month") {
          // Displaying Jan-Dec for the selected year
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          formattedData = months.map(m => ({ label: m, revenue: 0 }));

          const yearToFilter = parseInt(selectedYear);
          
          filteredTransactions = filteredTransactions.filter((t: any) => {
            // Use booking start_date for monthly/yearly analytics
            const bookingDateStr = t.booking?.start_date; 
        
            return bookingDateStr && new Date(bookingDateStr).getFullYear() === yearToFilter;
          });
          filteredTransactions.forEach((t: any) => {
            const date = new Date(t.booking.start_date); 
            const monthIndex = date.getMonth(); 
            if(formattedData[monthIndex]) {
              formattedData[monthIndex].revenue += Number(t.amount || 0);
            }
          });
          
        } else if (filter === "month-weeks") { 
            // ⭐️ BAG-ONG LOGIC: Week 1 - 5 for selected month/year
            formattedData = [
                { label: "Week 1", revenue: 0 },
                { label: "Week 2", revenue: 0 },
                { label: "Week 3", revenue: 0 },
                { label: "Week 4", revenue: 0 },
                { label: "Week 5", revenue: 0 },
            ];
            
            const yearToFilter = parseInt(selectedYear);
            
            filteredTransactions = filteredTransactions.filter((t: any) => { 
                const date = new Date(t.booking?.start_date); 
                // Filter transactions that fall within the selected year AND month
                return date.getFullYear() === yearToFilter && date.getMonth() === selectedMonth;
            });

            filteredTransactions.forEach((t: any) => {
                const date = new Date(t.booking?.start_date);
                // Use the support function to determine the week number
                const weekNumber = getWeekOfMonth(date); 
                const weekIndex = weekNumber - 1; // Week 1 -> Index 0
                
                // Ensure index is valid (0 to 4)
                if (weekIndex >= 0 && weekIndex < 5) {
                    formattedData[weekIndex].revenue += Number(t.amount || 0);
                }
            });

        } else if (filter === "week") {
          // Displaying sales for the current week (Sun-Sat)
          const startOfWeek = new Date(now); 
          startOfWeek.setDate(now.getDate() - now.getDay()); 
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek); 
          endOfWeek.setDate(startOfWeek.getDate() + 6); 
          endOfWeek.setHours(23, 59, 59, 999);
          
          filteredTransactions = filteredTransactions.filter((t: any) => { 
            // Use paid_at date for current week analytics
            const date = new Date(t.paid_at); 
            return date >= startOfWeek && date <= endOfWeek; 
          });
          
          const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          formattedData = weekDays.map((d) => ({ label: d, revenue: 0 }));
          
          filteredTransactions.forEach((t: any) => {
            const dayLabel = new Date(t.paid_at).toLocaleDateString("en-US", { weekday: "short" });
            const dayIndex = weekDays.indexOf(dayLabel);
            if(dayIndex !== -1) {
              formattedData[dayIndex].revenue += Number(t.amount || 0);
            }
          });
        }
        
        setSalesData(formattedData);

        const equipmentMap: Record<string, { revenue: number; count: number }> = {};
        
        // This logic remains the same, using the currently filtered transactions
        filteredTransactions.forEach((t: any) => {
          const name = t.booking?.equipment_name || "Unknown Equipment";
          if (!equipmentMap[name]) equipmentMap[name] = { revenue: 0, count: 0 };
          equipmentMap[name].revenue += t.amount || 0;
          equipmentMap[name].count += 1;
        });

        const top = Object.entries(equipmentMap)
            .map(([name, { revenue }]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        setTopEquipments(top);
        
        const countData = Object.entries(equipmentMap).map(([name, { count }]) => ({ label: name, count }));
        setEquipmentCountData(countData);

      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingAnalytics(false); setLoadingEquipments(false); setLoadingEquipmentCount(false);
      }
    };

    const fetchLogs = async () => {
      try {
        setLoadingLogs(true);
        const { data } = await supabase
          .from("activity_logs")
          .select("*")
          .order("date_in", { ascending: false }); 
        setActivityLogs(data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchData(); 
    fetchAnalytics();
    fetchLogs();
    
    const subscription = supabase.channel("bookings-updates").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => { fetchData(); fetchAnalytics(); }).subscribe();
  
    return () => { supabase.removeChannel(subscription); };
  }, [filter, selectedYear, selectedMonth]); 

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        const totalPages = Math.ceil(activityLogs.length / 5);
        
        const currentMonthName = monthNames[selectedMonth];
        let displayFilterLabel = filter.charAt(0).toUpperCase() + filter.slice(1);
        if (filter === "month-weeks") {
            displayFilterLabel = `Weeks (${currentMonthName} - ${selectedYear})`;
        } else if (["year", "month"].includes(filter)) {
            displayFilterLabel = `${displayFilterLabel} - ${selectedYear}`;
        }


        return (
          <IonGrid className="ion-padding">
            <IonRow>
              <IonCol size="12" sizeMd="3"><IonCard color="primary"><IonCardHeader><IonCardTitle>Total Equipment</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>{totalEquipment}</IonCardContent></IonCard></IonCol>
              <IonCol size="12" sizeMd="3"><IonCard color="success"><IonCardHeader><IonCardTitle>Today's Bookings</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>{todayBookings}</IonCardContent></IonCard></IonCol>
              <IonCol size="12" sizeMd="3"><IonCard color="tertiary"><IonCardHeader><IonCardTitle>Pending Bookings</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>{pendingBookings}</IonCardContent></IonCard></IonCol>
              <IonCol size="12" sizeMd="3"><IonCard color="warning"><IonCardHeader><IonCardTitle>Total Revenue</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</IonCardContent></IonCard></IonCol>
            </IonRow>
            <IonRow style={{ marginTop: "20px" }}>
              <IonCol size="12" sizeMd="8">
                <IonCard style={{ height: "350px" }}>
                  <IonCardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "left", flexWrap: "wrap" }}>
                    <IonCardTitle>Sales Analytics ({displayFilterLabel})</IonCardTitle>
                    
                    {["year"].includes(filter) && (
                      <IonItem lines="none" style={{ maxWidth: "150px", marginLeft: "auto", marginRight: "10px" }}>
                        <IonLabel>Year:</IonLabel>
                        <IonSelect value={selectedYear} onIonChange={(e) => setSelectedYear(e.detail.value)} interface="popover">
                          {yearsList.map((year) => (
                            <IonSelectOption key={year} value={year}>{year}</IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    )}
                    {filter === "month-weeks" && (
                        <IonItem lines="none" style={{ maxWidth: "200px", marginRight: "10px" }}>
                            <IonLabel>Month:</IonLabel>
                            <IonSelect value={selectedMonth} onIonChange={(e) => setSelectedMonth(e.detail.value)} interface="popover">
                                {monthNames.map((month, index) => (
                                    <IonSelectOption key={index} value={index}>{month}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    )}
                    <IonItem lines="none" style={{ maxWidth: "200px", marginLeft: "auto", marginRight: 0 }}>
                      <IonLabel>Filter:</IonLabel>
                      <IonSelect value={filter} onIonChange={(e) => setFilter(e.detail.value as "month" | "year" | "month-weeks")} interface="popover">
                        <IonSelectOption value="month-weeks">Month (Week 1-5)</IonSelectOption>
                        <IonSelectOption value="month">Monthly (Jan-Dec)</IonSelectOption>
                        <IonSelectOption value="year">Yearly</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCardHeader>
                  <IonCardContent>{loadingAnalytics ? ( <IonSpinner name="dots" /> ) : (
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                        <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>{salesData.map((entry, index) => (<Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />))}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}</IonCardContent>
                </IonCard>
                <IonCard style={{ height: "350px", marginTop: "20px" }}>
                  <IonCardHeader><IonCardTitle>Equipment Analytics (Total Bookings)</IonCardTitle></IonCardHeader>
                  <IonCardContent>{loadingEquipmentCount ? ( <IonSpinner name="dots" /> ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={equipmentCountData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>{equipmentCountData.map((entry, index) => (<Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />))}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}</IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonCard style={{ height: "230px" }}>
                  <IonCardHeader><IonCardTitle>Top Equipment ({filter.charAt(0).toUpperCase() + filter.slice(1)})</IonCardTitle></IonCardHeader>
                  <IonCardContent>{loadingEquipments ? ( <IonSpinner name="dots" /> ) : topEquipments.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={topEquipments} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} label>
                          {topEquipments.map((entry, index) => (<Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : ( <p style={{textAlign: "center", marginTop: "20px"}}>No sales data for this period.</p> )}
                  </IonCardContent>
                </IonCard>
                <IonCard style={{ height: "470px", marginTop: "20px" }}>
                  <IonCardHeader><IonCardTitle>Activity Logs</IonCardTitle></IonCardHeader>
                  <IonCardContent style={{ overflowY: "auto" }}>{loadingLogs ? ( <IonSpinner name="dots" /> ) : activityLogs.length > 0 ? (
                    <>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead><tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}><th style={{ padding: "6px" }}>#</th><th style={{ padding: "6px" }}>Name</th><th style={{ padding: "6px" }}>Role</th><th style={{ padding: "6px" }}>Login</th><th style={{ padding: "6px" }}>Logout</th></tr></thead>
                        <tbody>
                          {activityLogs.slice((currentPage - 1) * 5, currentPage * 5).map((log, index) => (
                            <tr key={log.log_id} style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: "6px" }}>{(currentPage - 1) * 5 + index + 1}</td><td style={{ padding: "6px" }}>{log.name}</td><td style={{ padding: "6px" }}>{log.role}</td>
                              <td style={{ padding: "6px" }}>{log.date_in ? new Date(log.date_in).toLocaleString() : "-"}</td>
                              <td style={{ padding: "6px" }}>{log.date_out ? new Date(log.date_out).toLocaleString() : "— Active"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                        <IonButton size="small" fill="outline" color="warning" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt;</IonButton>
                        <span>Page {currentPage} of {totalPages}</span>
                        <IonButton size="small" fill="outline" color="warning" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>&gt;</IonButton>
                      </div>
                    </>
                  ) : ( <p>No activity logs available.</p> )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
      case "generatereports": return <Admin_GenerateReports />;
      case "bookings": return <Staff_BookingsTab />;
      case "manageequipment": return <Admin_Manageequipment />;
      case "viewcbookingcalendar": return <Admin_ViewBookingCalendar />;
      case "managerentalbookings": return <Admin_ManageRentalBookings />;
      case "viewalltransactions": return <Admin_ViewAllTransactions />;
      case "manageusers": return <Admin_ManageUsers />;
      case "registermember": return <Admin_RegisterMember />;
      case "myprofile": return <Admin_Myprofile />;
      default: return null;
    }
  };

  return (
    <> 
      <DashboardStyles />
      
      <Admin_AdminSidebar 
        setActiveTab={setActiveTab} 
        activeTab={activeTab} 
      />
  
      <IonPage id="main-dashboard-content">
        <Admin_AdminHeaderBar />
        <IonContent scrollY={true} color="light">
          {renderContent()}
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminDashboard;