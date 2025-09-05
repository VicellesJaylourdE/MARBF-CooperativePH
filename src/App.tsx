import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Ionic CSS imports */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';

import Login from './pages/Login';
import Menu from './pages/Menu';
import Register from './pages/Register';
import LandingPage from './pages/Landingpage';
import LearnMore from './pages/LearnMore';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      {/* ✅ SplitPane para sa side menu */}
      <IonSplitPane contentId="main">
        {/* ✅ Side Menu (mobile only) */}
        <IonMenu contentId="main" type="overlay" className="ion-hide-md-up">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem routerLink="/booking">
                <IonLabel>Booking</IonLabel>
              </IonItem>
              <IonItem routerLink="/about">
                <IonLabel>About Us</IonLabel>
              </IonItem>
              <IonItem routerLink="/contact">
                <IonLabel>Contact</IonLabel>
              </IonItem>
              <IonItem routerLink="/login">
                <IonLabel>Sign In</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonMenu>

        {/* ✅ Main content */}
        <IonRouterOutlet id="main">
          <Switch>
            {/* Landing page */}
            <Route exact path="/" component={LandingPage} />

            {/* Auth */}
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />

            {/* Learn More */}
            <Route exact path="/learnmore" component={LearnMore} />

            {/* Main app (with tabs) */}
            <Route path="/MARBF-Cooperative01/app" component={Menu} />

            {/* Redirect unknown paths */}
            <Redirect to="/" />
          </Switch>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;