import React from 'react';

import { useAuth } from 'src/context/hooks';

interface Props {
  children: React.ReactElement;
}

const AdminGuard = ({ children }: Props) => {
  const auth = useAuth();

  return auth.isAdmin ? children : null;
};

export default AdminGuard;
