import { Box, SxProps } from '@mui/material';

const OnlineStatus = ({ size = 5, sx }: { size?: number; sx?: SxProps }) => {
  return (
    <Box
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'green',
        animation: 'pulse 1.5s infinite ease-in-out',
        '@keyframes pulse': {
          '0%': { transform: 'scale(0.9)', opacity: 0.7 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
          '100%': { transform: 'scale(0.9)', opacity: 0.7 },
        },
        ...sx,
      }}
    />
  );
};

export default OnlineStatus;
