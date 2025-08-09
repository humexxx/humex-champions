import { ReactNode, PropsWithChildren } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  loading?: boolean;
  icon?: ReactNode;
  redirectPath?: string;
};

const MetricsCard = ({
  title,
  loading,
  icon,
  redirectPath,
  children,
}: PropsWithChildren<Props>) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Button
          variant="text"
          size="small"
          color="inherit"
          startIcon={icon}
          onClick={handleRedirect}
        >
          {title}
        </Button>
        <Box
          height={300}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {loading ? <CircularProgress size={32} /> : children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
