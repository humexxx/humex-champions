import { Box } from '@mui/material';

type Props = {
  children: React.ReactNode;
};

const PageContent = ({ children }: Props) => {
  return <Box component={'section'}>{children}</Box>;
};

export default PageContent;
