// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { PrivateRouteProps } from './PrivateRoute.types';
import { useAuth } from 'src/context/auth';

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  return children;
};

export default PrivateRoute;
