import React from 'react';
import { Box, Typography } from '@mui/material';

type Props = {
  children?: React.ReactNode;
  title?: string;
  description?: string;
};

const PageHeader = ({ children, title, description }: Props) => {
  return (
    <Box mb={4}>
      {Boolean(title) && (
        <Typography variant="h6" component="h2" gutterBottom>
          <strong>{title}</strong>
        </Typography>
      )}
      {Boolean(description) && (
        <Typography variant="body1">{description}</Typography>
      )}
      {children}
    </Box>
  );
};

export default PageHeader;
