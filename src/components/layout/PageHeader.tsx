import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const SECONDARY_HEADER_HEIGHT = 62;

type Props = {
  title: string;
  navigator?: {
    breadcrumb: { title: string; route: string }[];
    link: { title: string; route: string };
  };
  description?: string;
};

const PageHeader = ({ title, navigator, description }: Props) => {
  return (
    <Box component={'header'} my={2}>
      {navigator ? (
        <Breadcrumbs aria-label="navigator">
          <Typography
            variant="body2"
            component={Link}
            to={navigator.link.route}
            color={'info.main'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} color="inherit" />
            {navigator.link.title}
          </Typography>
          {navigator.breadcrumb.map((item) => (
            <Typography
              key={item.route}
              variant="body1"
              color="text.primary"
              component={'h1'}
            >
              <strong>{item.title}</strong>
            </Typography>
          ))}
        </Breadcrumbs>
      ) : (
        <Typography variant="h6" component="h1">
          <strong>{title}</strong>
        </Typography>
      )}
      {Boolean(description) && (
        <Typography mt={1} variant="body2">
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
