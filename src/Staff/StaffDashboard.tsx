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
import StaffHeaderBar from "../components/Staff_StaffHeaderBar";
import StaffSidebar from "../components/Staff_StaffSidebar";
import { supabase } from "../utils/supabaseClient";

import DashboardCards from "./DashboardCards";
import Staff_UsersTab from "../components/Staff_UsersTab";
import ReportsTab from "./ReportsTab";
import MonthlyRevenueTab from "./MonthlyRevenueTab";
import Staff_BookingsTab from "../components/Staff_BookingsTab";
import TransactionsTab from "./TransactionsTab";

const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [totalEquipment, setTotalEquipment] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: equipmentCount } = await supabase
          .from("equipment")
          .select("*", { count: "exact", head: true });
        setTotalEquipment(equipmentCount || 0);

        const today = new Date().toISOString().split("T")[0];
        const { count: bookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("date", today);
        setTodayBookings(bookingsCount || 0);

        const { data: revenueData } = await supabase
          .from("transactions")
          .select("amount");
        if (revenueData) {
          const revenueSum = revenueData.reduce(
            (acc, cur) => acc + Number(cur.amount),
            0
          );
          setTotalRevenue(revenueSum);
        }

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
              {/* Users Column */}
              <IonCol size="12" sizeMd="10" sizeLg="5">
                <IonCardContent style={{ height: "100%", overflow: "auto" }}>
                  <Staff_UsersTab />
                </IonCardContent>
              </IonCol>

              {/* Bookings Column */}
              <IonCol size="12" sizeMd="5" sizeLg="7">
                <IonCard style={{ height: "400px" }}>
                  <Staff_BookingsTab />
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
      case "users":
        return <Staff_UsersTab />;
      case "reports":
        return <ReportsTab />;
      case "monthly revenue":
        return <MonthlyRevenueTab />;
      case "bookings":
        return <Staff_BookingsTab />;
      case "transactions":
        return <TransactionsTab />;
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

export default StaffDashboard;
