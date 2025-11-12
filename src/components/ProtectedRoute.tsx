

import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type AllowedRole = 'admin' | 'staff' | 'user';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  allowedRoles: AllowedRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  component: Component, 
  allowedRoles, 
  ...rest 
}) => {
 
  const { user, role, loading } = useAuth(); 

  if (loading) {
    return <div>Loading Authentication...</div>; 
  }

  return (
    <Route
      {...rest}
      render={(props) => {

        if (!user) {
          return <Redirect to="/" />;
        }

        if (!role || !allowedRoles.includes(role as AllowedRole)) {
         
          return <Redirect to="/user-dashboard" />; 
        }

    
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;