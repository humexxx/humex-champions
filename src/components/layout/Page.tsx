import { PropsWithChildren } from 'react';

import { Container } from '@mui/material';
import { useDocumentMetadata } from 'src/hooks';

type Props = {
  title: string;
  useContainer?: boolean;
};

const Page = ({
  children,
  title,
  useContainer = true,
}: PropsWithChildren<Props>) => {
  useDocumentMetadata(`${title} - Champions`);

  if (useContainer) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    );
  }

  return children;
};

export default Page;
