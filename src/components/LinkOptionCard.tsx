import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  route: string;
  label: string;
  description: string;
  icon: ReactNode;
};

const LinkOptionCard = ({ icon, description, label, route }: Props) => {
  return (
    <Link unstable_viewTransition to={route} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <CardActionArea sx={{ height: '100%' }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box>
              <Paper
                sx={{
                  display: 'inline-block',
                  p: 1,
                  mb: 1,
                  border: '1px solid rgba(205, 209, 228, 0.2)',
                }}
              >
                {icon}
              </Paper>
              <Typography
                variant="body1"
                component="h3"
                my={2}
                sx={{
                  viewTransitionName: route,
                }}
              >
                <strong>{label}</strong>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default LinkOptionCard;
