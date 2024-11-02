import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDocumentMetadata } from 'src/hooks';

type Props = {
  title: string;
  breadcrumb?: { title: string; route: string }[];
  description?: string;
};

const PageHeader = ({ title, breadcrumb, description }: Props) => {
  useDocumentMetadata(`${title} - Champions`);

  return (
    <Box mb={4} component={'header'}>
      {breadcrumb ? (
        <Breadcrumbs aria-label="navigator" sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to={breadcrumb[0].route}
            unstable_viewTransition
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
                variant="h6"
                style={{
                  viewTransitionName: item.route,
                }}
                color="text.primary"
              >
                <strong>{item.title}</strong>
              </Typography>
            ))}
        </Breadcrumbs>
      ) : (
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
