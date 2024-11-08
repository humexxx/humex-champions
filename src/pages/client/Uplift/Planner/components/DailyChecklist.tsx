import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { IPlanner } from '@shared/models/uplift';
import { Dayjs } from 'dayjs';

import DailyChecklistForm from './DailyChecklistForm';
import { UseUplift } from '../../hooks/useUplift';
import { usePlannerSetter } from '../hooks';

const DailyChecklist = ({
  day,
  data,
  uplift,
}: {
  day: Dayjs;
  data?: IPlanner<Dayjs>;
  uplift: UseUplift;
}) => {
  const { set } = usePlannerSetter();

  const handleOnChange = (index: number, checked: boolean) => () => {
    if (!data) return;
    data.items[index].completed = !checked;
    set(data);
  };

  const handleOnDelete = (index: number) => () => {
    if (!data) return;
    data.items.splice(index, 1);
    set(data);
  };

  return (
    <Card variant={'outlined'} sx={{ minHeight: 500 }}>
      <CardContent sx={{ p: 2 }}>
        <Container maxWidth="xs" sx={{ marginLeft: 0 }}>
          <Typography variant={'h6'}>
            {day.format('dddd')}
            <Typography component={'span'} variant={'body2'} sx={{ ml: 1 }}>
              {day.format('MMM DD')}
            </Typography>
          </Typography>
          <Box py={2}>
            <DailyChecklistForm
              planner={data ?? { date: day, items: [] }}
              uplift={uplift}
            />
          </Box>
          <List>
            {data?.items.map((item, index) => (
              <ListItem
                key={index}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={handleOnDelete(index)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                }
              >
                <ListItemButton
                  role="button"
                  onClick={handleOnChange(index, item.completed)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={item.completed}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': '1' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Stack direction={'row'} gap={1} mt={0.5}>
                        <Chip label={'test'} />
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Container>
      </CardContent>
    </Card>
  );
};

export default DailyChecklist;
