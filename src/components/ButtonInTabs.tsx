import { Box, Tooltip, IconButton } from '@mui/material';

interface Props {
  onClick: () => void;
  tooltipText: string;
  disabled?: boolean;
  icon: React.ReactNode;
}

function ButtonInTabs({ onClick, tooltipText, icon, disabled = false }: Props) {
  return (
    <Box>
      <Tooltip title={tooltipText}>
        <Box sx={{ display: 'inline-block' }}>
          <IconButton color="primary" onClick={onClick} disabled={disabled}>
            {icon}
          </IconButton>
        </Box>
      </Tooltip>
    </Box>
  );
}

export default ButtonInTabs;
