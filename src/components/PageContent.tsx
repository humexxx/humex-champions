import { Box } from '@mui/material';

type Props = {
  children: React.ReactNode;
};

const PageContent = ({ children }: Props) => {
  return <Box>{children}</Box>;
};

export default PageContent;
