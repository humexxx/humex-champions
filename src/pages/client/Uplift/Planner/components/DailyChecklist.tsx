import {
  Box,
  Card,
  CardContent,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { IPlanner } from '@shared/models/uplift';
import { Dayjs } from 'dayjs';

import Form from './Form';

const DailyChecklist = ({
  day,
  data,
}: {
  day: Dayjs;
  data?: IPlanner<Dayjs>;
}) => {
  return (
    <Card variant={'outlined'} sx={{ minHeight: 500 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant={'h6'}>
          {day.format('dddd')}
          <Typography component={'span'} variant={'body2'} sx={{ ml: 1 }}>
            {day.format('MMM DD')}
          </Typography>
        </Typography>
      </CardContent>
      <Box p={2}>
        <Form planner={data ?? { date: day, items: [] }} />
      </Box>
      <List>
        {data?.items.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton role={undefined} dense>
              <ListItemIcon sx={{ minWidth: 'auto' }}>
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
                primaryTypographyProps={{ fontSize: '0.775rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default DailyChecklist;
