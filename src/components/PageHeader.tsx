import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Breadcrumbs, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDocumentMetadata } from 'src/hooks';
import { MAIN_HEADER_HEIGHT } from 'src/layouts/components/Header';

export const SECONDARY_HEADER_HEIGHT = 62;

type Props = {
  title: string;
  breadcrumb?: { title: string; route: string }[];
  description?: string;
  hideHeader?: boolean;
};

const PageHeader = ({ title, breadcrumb, description, hideHeader }: Props) => {
  useDocumentMetadata(`${title} - Champions`);

  if (hideHeader) {
    return null;
  }

  return (
    <Toolbar
      sx={{
        height: SECONDARY_HEADER_HEIGHT,
        minHeight: `${SECONDARY_HEADER_HEIGHT}px !important`,
        position: 'fixed',
        top: `${MAIN_HEADER_HEIGHT}px`,
        zIndex: 1000,
        width: '100%',
        backdropFilter: 'blur(8px)',
        backgroudColor: 'hsla(0, 0%, 100%, 0.6);',
      }}
    >
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
      {/* {Boolean(description) && (
          <Typography variant="body1">{description}</Typography>
        )} */}
    </Toolbar>
  );
};

export default PageHeader;
