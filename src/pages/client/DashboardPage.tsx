import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from 'src/firebase';

const DashboardPage = () => {
  const navigate = useNavigate();

  function handleLogout() {
    auth
      .signOut()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div>
      <Button variant="outlined" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default DashboardPage;
