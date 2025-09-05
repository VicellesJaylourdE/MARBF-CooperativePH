import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
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
      <IonRouterOutlet>
        <Switch>
          {/* Landing page */}
          <Route exact path="/" component={LandingPage} />

          {/* Auth */}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          {/* Learn More */}
          <Route exact path="/learnmore" component={LearnMore} />

          {/* Main app (with tabs) */}
          <Route path="/MARBF-CooperativePH/app" component={Menu} />

          {/* Redirect unknown paths */}
          <Redirect to="/" />
        </Switch>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;