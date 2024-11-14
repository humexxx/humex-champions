import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDocumentMetadata } from 'src/hooks';

export const SECONDARY_HEADER_HEIGHT = 62;

type Props = {
  title: string;
  breadcrumb?: { title: string; route: string }[];
  description?: string;
  hideHeader?: boolean;
};

const PageHeader = ({ title, breadcrumb, hideHeader, description }: Props) => {
  useDocumentMetadata(`${title} - Champions`);

  if (hideHeader) {
    return null;
  }

  return (
    <Box component={'header'} mb={8}>
      {breadcrumb ? (
        <Breadcrumbs aria-label="navigator">
          <Typography
            variant="body2"
            component={Link}
            to={breadcrumb[0].route}
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
            {breadcrumb[0].title}
          </Typography>
          {breadcrumb
            .filter((_, index) => index > 0)
            .map((item) => (
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
