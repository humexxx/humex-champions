import { Alert, Card, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useAuth } from 'src/context/hooks';

interface AdminCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  showAlert?: boolean;
}

/**
 * AdminCard - Reusable component for admin-only sections
 *
 * This component automatically handles admin check and renders children
 * only if the user is an admin. Can be used across different pages/sections.
 */
const AdminCard = ({
  title = '🛠️ Admin Panel',
  description = 'This section is only visible to administrators.',
  children,
  showAlert = true,
}: AdminCardProps) => {
  const { isAdmin } = useAuth();

  // Early return if not admin - component controls its own visibility
  if (!isAdmin) {
    return null;
  }

  return (
    <Card variant="elevation" elevation={3} sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: showAlert ? 2 : 3,
            color: 'warning.main',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        {showAlert && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {description}
          </Alert>
        )}

        {children}
      </CardContent>
    </Card>
  );
};

export default AdminCard;
