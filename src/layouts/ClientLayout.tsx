import { Outlet } from 'react-router-dom';
import PrivateRoute from 'src/components/common/private-route';

const ClientLayout = () => {
  return (
    <PrivateRoute>
      <div>
        ClientLayout
        <Outlet />
      </div>
    </PrivateRoute>
  );
};

export default ClientLayout;
