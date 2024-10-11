import { useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import { getTradingQuoteOfTheDay } from 'src/services/tradingQuotes';

const Quote = () => {
  const { quote, author } = useMemo(() => getTradingQuoteOfTheDay(), []);

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 4,
        borderRadius: 2,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h6"
        component="p"
        sx={{
          fontFamily: '"Caveat", cursive',
          fontStyle: 'italic',
          color: 'text.primary',
          marginBottom: 2,
          '&::before': {
            content: '"“"',
            fontSize: '2rem',
            verticalAlign: 'top',
            marginRight: '4px',
          },
          '&::after': {
            content: '"”"',
            fontSize: '2rem',
            verticalAlign: 'bottom',
            marginLeft: '4px',
          },
        }}
      >
        {quote}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontFamily: '"Caveat", cursive',
          color: 'text.secondary',
          marginTop: 4,
        }}
      >
        - {author}
      </Typography>
    </Box>
  );
};

export default Quote;
