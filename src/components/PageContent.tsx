import { Box, Container } from '@mui/material';

import { SECONDARY_HEADER_HEIGHT } from './PageHeader';

type Props = {
  children: React.ReactNode;
  hideHeader?: boolean;
};

const PageContent = ({ children, hideHeader }: Props) => {
  return (
    <Box pt={hideHeader ? 0 : `${SECONDARY_HEADER_HEIGHT}px`}>
      <Container maxWidth="xl" sx={{ py: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageContent;
