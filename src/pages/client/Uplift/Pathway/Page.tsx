import React, { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Grid,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';

interface TaskFormData {
  description: string;
  frequency: string;
}

interface Task extends TaskFormData {
  completed: boolean;
}

const taskSchema = yup.object().shape({
  description: yup.string().required('Task description is required'),
  frequency: yup.string().required('Frequency is required'),
});

const Page: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      description: '',
      frequency: 'daily',
    },
  });

  const handleAddTask = (data: TaskFormData) => {
    setTasks([...tasks, { ...data, completed: false }]);
    reset();
  };

  const handleToggleTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  // Calculate the data for the pie chart
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const data = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: totalTasks - completedTasks },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        aria-label="Goals Tabs"
      >
        <Tab label="Tasks" />
        <Tab label="Add Task" />
      </Tabs>
      {tabValue === 0 && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} paddingRight={'23px'}>
              <Typography variant="h6">Your Tasks</Typography>
              {tasks.map((task, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1,
                    transition: 'all 0.3s ease-in-out',
                    transform: task.completed ? 'scale(0.98)' : 'scale(1)',
                    opacity: task.completed ? 0.6 : 1,
                  }}
                >
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleToggleTask(index)}
                    sx={{
                      transform: 'scale(1.5)',
                      color: task.completed ? 'success.main' : 'primary.main',
                    }}
                  />
                  <Typography>{task.description}</Typography>
                </Box>
              ))}
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ mr: '-1px' }} />
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Progress</Typography>
              <PieChart
                height={300}
                series={[
                  {
                    startAngle: -90,
                    endAngle: 90,
                    data,
                    innerRadius: 80,
                  },
                ]}
              />
              <Typography variant="body1" sx={{ mt: 2 }}>
                {totalTasks > 0
                  ? `You have completed ${completedTasks} out of ${totalTasks} tasks (${((completedTasks / totalTasks) * 100).toFixed(1)}%).`
                  : 'No tasks added yet.'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} paddingRight={'23px'}>
              Agregar datos valiosos en el futuro
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ mr: '-1px' }} />
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Add New Task</Typography>
              <form onSubmit={handleSubmit(handleAddTask)}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Task Description"
                      fullWidth
                      sx={{ mb: 2 }}
                      error={!!error}
                      helperText={error ? error.message : ''}
                    />
                  )}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Frequency</InputLabel>
                  <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Frequency">
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="everyOtherDay">
                          Every Other Day
                        </MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
                <Button type="submit" variant="contained">
                  Add Task
                </Button>
              </form>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Page;
