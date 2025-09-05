import { 
  IonButton,
    IonButtons,
      IonContent, 
      IonHeader, 
      IonIcon, 
      IonLabel, 
      IonMenuButton, 
      IonPage, 
      IonRouterOutlet, 
      IonTabBar, 
      IonTabButton, 
      IonTabs, 
      IonTitle, 
      IonToolbar 
  } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { bookOutline, person, search, star } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';

import SignUp from './SignUp';
  const Home: React.FC = () => {

    const tabs = [
      {name:'Feed', tab:'feed',url: '/MARBF-CooperativePH/app/home/feed', icon: bookOutline},
      {name:'Search', tab:'search', url: '/MARBF-CooperativePH/app/home/search', icon: search},
      {name:'Favorites',tab:'favorites', url: '/MARBF-CooperativePH/app/home/favorites', icon: star},
      {name:'About me',tab:'About Me', url: '/MARBF-CooperativePH/app/home/about_me', icon: person},
    ]
    
    return (
      <IonReactRouter>
        <IonTabs>
          <IonTabBar slot="bottom">

            {tabs.map((item, index) => (
              <IonTabButton key={index} tab={item.tab} href={item.url}>
                <IonIcon icon={item.icon} />
                <IonLabel>{item.name}</IonLabel>
              </IonTabButton>
            ))}
            
          </IonTabBar>
        <IonRouterOutlet>

    

          <Route exact path="/MARBF-CooperativePH/app/home">
            <Redirect to="/MARBF-CooperativePH/app/home/feed" />
          </Route>

        </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    );
  };
  
  export default Home;