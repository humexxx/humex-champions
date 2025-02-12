import React from 'react';

import { Navigate } from 'react-router-dom';
import { ROUTES } from 'src/consts';
import { useAuth } from 'src/context/hooks';

interface Props {
  children: React.ReactElement;
}

const AutoLogRoute: React.FC<Props> = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to={ROUTES.PORTAL.DASHBOARD} replace />;
  }

  return children;
};

export default AutoLogRoute;
