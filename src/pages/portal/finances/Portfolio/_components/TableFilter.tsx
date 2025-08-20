import {
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  KeyboardArrowDown,
  Check,
  NorthEast,
  SouthEast,
} from '@mui/icons-material';
import { useState, useCallback, useMemo } from 'react';

export type SortField = 'date' | 'amount' | 'name' | 'value';
export type SortOrder = 'asc' | 'desc';

interface TableFilterProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  availableFields: {
    field: SortField;
    label: string;
    icon: React.ReactNode;
  }[];
}

const TableFilter = ({
  sortBy,
  sortOrder,
  onSortChange,
  availableFields,
}: TableFilterProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSortChange = useCallback(
    (field: SortField, order: SortOrder) => {
      onSortChange(field, order);
      setAnchorEl(null);
    },
    [onSortChange]
  );

  const getCurrentFieldLabel = useMemo(() => {
    const currentField = availableFields.find((f) => f.field === sortBy);
    return currentField?.label || 'date';
  }, [availableFields, sortBy]);

  return (
    <>
      <Button
        color="info"
        variant="text"
        endIcon={<KeyboardArrowDown />}
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          borderColor: 'divider',
        }}
      >
        Sort by {getCurrentFieldLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 200 },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1, color: 'text.secondary' }}
        >
          Sort by:
        </Typography>
        {availableFields.map((field) => (
          <MenuItem
            key={field.field}
            onClick={() => handleSortChange(field.field, sortOrder)}
          >
            <ListItemIcon>{field.icon}</ListItemIcon>
            <ListItemText primary={field.label} />
            {sortBy === field.field && (
              <Check fontSize="small" color="primary" />
            )}
          </MenuItem>
        ))}
        <Divider />
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1, color: 'text.secondary' }}
        >
          Direction:
        </Typography>

        <MenuItem onClick={() => handleSortChange(sortBy, 'asc')}>
          <ListItemIcon>
            <NorthEast fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Low to High" />
          {sortOrder === 'asc' && <Check fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSortChange(sortBy, 'desc')}>
          <ListItemIcon>
            <SouthEast fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="High to Low" />
          {sortOrder === 'desc' && <Check fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>
    </>
  );
};

export default TableFilter;
