import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonSplitPane,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import StaffHeaderBar from "../components/Admin_AdminHeaderBar";
import StaffSidebar from "../components/Admin_AdminSidebar";
import { supabase } from "../utils/supabaseClient";

import DashboardCards from "./AdminDashboardCards";
import Staff_UsersTab from "../components/Staff_UsersTab";
import Admin_GenerateReports from "../components/Admin_GenerateReports";
import Staff_BookingsTab from "../components/Staff_BookingsTab";
import Admin_UsersTab from "../components/Admin_UsersTab";
import Admin_Manageequipment from "../components/Admin_Manageequipment";
import Admin_ViewBookingCalendar from "../components/Admin_ViewBookingCalendar";
import Admin_ManageRentalBookings from "../components/Admin_ManageRentalBookings";
import Admin_ViewAllTransactions from "../components/Admin_ViewAllTransactions";
import Admin_ManageUsers from "../components/Admin_ManageUsers";
import Admin_LateReturnPenalty from "../components/Admin_LateReturnPenalty";
import Admin_RegisterMember from "../components/Admin_RegisterMember";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Count total equipment
        const { count: equipmentCount } = await supabase
          .from("equipment")
          .select("*", { count: "exact", head: true });
        setTotalEquipment(equipmentCount || 0);

        // Count today's bookings
        const today = new Date().toISOString().split("T")[0];
        const { count: bookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("date", today);
        setTodayBookings(bookingsCount || 0);

        // Fetch revenue only for APPROVED bookings
        const { data: approvedBookings, error: bookingError } = await supabase
          .from("bookings")
          .select("id")
          .eq("status", "approved");

        if (bookingError) {
          console.error("Error fetching approved bookings:", bookingError);
        } else {
          const approvedIds = approvedBookings?.map((b) => b.id) || [];

          if (approvedIds.length > 0) {
            const { data: revenueData, error: revenueError } = await supabase
              .from("transactions")
              .select("amount, booking_id")
              .in("booking_id", approvedIds);

            if (revenueError) {
              console.error("Error fetching revenue data:", revenueError);
            } else if (revenueData) {
              const revenueSum = revenueData.reduce(
                (acc, cur) => acc + Number(cur.amount),
                0
              );
              setTotalRevenue(revenueSum);
            }
          } else {
            setTotalRevenue(0);
          }
        }

        // Count total users
        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
        setTotalUsers(usersCount || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <IonGrid className="ion-padding">
            <DashboardCards
              totalEquipment={totalEquipment}
              todayBookings={todayBookings}
              totalRevenue={totalRevenue}
              totalUsers={totalUsers}
            />

            <IonRow>
              <IonCol size="12" sizeMd="10" sizeLg="5">
                <IonCardContent style={{ height: "100%", overflow: "auto" }}>
                  <Admin_UsersTab />
                </IonCardContent>
              </IonCol>

              <IonCol size="12" sizeMd="5" sizeLg="7">
                <IonCard style={{ height: "400px" }}>
                  <Admin_ViewBookingCalendar />
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
      case "users":
        return <Admin_UsersTab />;
      case "generatereports":
        return <Admin_GenerateReports />;
      case "bookings":
        return <Staff_BookingsTab />;
      case "manageequipment":
        return <Admin_Manageequipment />;
      case "viewcbookingcalendar":
        return <Admin_ViewBookingCalendar />;
      case "managerentalbookings":
        return <Admin_ManageRentalBookings />;
      case "viewalltransactions":
        return <Admin_ViewAllTransactions />;
      case "manageusers":
        return <Admin_ManageUsers />;
      case "latereturnpenalty":
        return <Admin_LateReturnPenalty />;
      case "registermember":
        return <Admin_RegisterMember />;
      default:
        return null;
    }
  };

  return (
    <IonSplitPane contentId="staff-main" when={false}>
      <StaffSidebar setActiveTab={setActiveTab} />
      <IonPage id="staff-main">
        <StaffHeaderBar />
        <IonContent scrollY={true}>{renderContent()}</IonContent>
      </IonPage>
    </IonSplitPane>
  );
};

export default AdminDashboard;
