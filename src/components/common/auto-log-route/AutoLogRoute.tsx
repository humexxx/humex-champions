import React from 'react';
import { Navigate } from 'react-router-dom';
import { AutoLogRouteProps } from './AutoLogRoute.types';
import { useAuth } from 'src/context/auth';

const AutoLogRoute: React.FC<AutoLogRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/client/dashboard" replace />;
  }

  return children;
};

export default AutoLogRoute;
