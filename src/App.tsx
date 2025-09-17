import { Redirect, Route, Switch } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonSplitPane,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Ionic CSS imports */
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
import LandingPage from "./pages/Landingpage";
import LearnMore from "./pages/LearnMore";
import RightSideMenu from "./pages/Rightsidemenu";

/* 🆕 Import dashboards */
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <RightSideMenu />
        <IonRouterOutlet id="main">
          <Switch>
            <Route exact path="/" component={LandingPage} />

            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/learnmore" component={LearnMore} />
            <Route path="/MARBF-CooperativePH/app" component={Menu} />

           
            <Route exact path="/admin-dashboard" component={AdminDashboard} />
            <Route exact path="/user-dashboard" component={UserDashboard} />

            <Redirect to="/" />
          </Switch>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;