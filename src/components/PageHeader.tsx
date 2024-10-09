import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDocumentMetadata } from 'src/hooks';

type Props = {
  children?: React.ReactNode;
  title?: string;
  description?: string;
};

const PageHeader = ({ title, description }: Props) => {
  useDocumentMetadata(`${title} - Champions`);
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
    </Box>
  );
};

export default PageHeader;
