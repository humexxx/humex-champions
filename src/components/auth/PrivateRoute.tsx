// src/components/PrivateRoute.tsx
import React from 'react';

import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/context/auth';

interface Props {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  return children;
};

export default PrivateRoute;
