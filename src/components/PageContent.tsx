import { Box } from '@mui/material';

type Props = {
  children: React.ReactNode;
};

const PageContent = ({ children }: Props) => {
  return <Box mt={2}>{children}</Box>;
};

export default PageContent;
