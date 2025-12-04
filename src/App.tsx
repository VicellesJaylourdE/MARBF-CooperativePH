
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonSplitPane,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";

import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Register from "./pages/Register";
import RegisterAll from "./pages/RegisterAll";
import LandingPage from "./pages/Landingpage";
import LearnMore from "./pages/LearnMore";
import RightSideMenu from "./pages/Rightsidemenu";
import AdminDashboard from "./Admin/AdminDashboard";
import UserDashboard from "./Farmers/UserDashboard";
import StaffDashboard from "./Staff/StaffDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import Registerphone from "./pages/Registerphone";
import RegisterOne from "./pages/RegisterOne";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <MainRouter />
    </IonReactRouter>
  </IonApp>
);

const MainRouter: React.FC = () => {
  const location = useLocation();

  if (location.pathname === "/") {
    return (
      <IonSplitPane contentId="main">
        <RightSideMenu />
        <IonRouterOutlet id="main">
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Redirect to="/" />
          </Switch>
        </IonRouterOutlet>
      </IonSplitPane>
    );
  }

  return (
    <IonRouterOutlet id="main">
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} exact />
       <Route path="/verify-otp" component={VerifyOtp} exact />
        <Route exact path="/register" component={Register} />
          <Route exact path="/registerone" component={RegisterOne} />
         <Route exact path="/registerall" component={RegisterAll} />
         <Route exact path="/registerphone" component={Registerphone} />
        <Route exact path="/learnmore" component={LearnMore} />
        <Route path="/MARBF-CooperativePH/app" component={Menu} />
        <Route exact path="/admin-dashboard" component={AdminDashboard} />
        <Route exact path="/user-dashboard" component={UserDashboard} />
        <Route exact path="/staff-dashboard" component={StaffDashboard} />
        <Redirect to="/" />
      </Switch>
    </IonRouterOutlet>
  );
};

export default App;