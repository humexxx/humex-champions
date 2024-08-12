import React from 'react';
import { Box } from '@mui/material';

type Props = {
  children: React.ReactNode;
};

const PageHeader = ({ children }: Props) => {
  return <Box mb={8}>{children}</Box>;
};

export default PageHeader;
