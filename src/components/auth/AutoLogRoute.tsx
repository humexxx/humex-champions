import React from 'react';

import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/context/auth';

interface Props {
  children: React.ReactElement;
}

const AutoLogRoute: React.FC<Props> = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/client/dashboard" replace />;
  }

  return children;
};

export default AutoLogRoute;
