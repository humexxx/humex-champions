import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ETodoCategory, ETodoPriority, ITodoList } from '@shared/types/uplift';
import { useUpliftService } from 'src/services/upliftService';

interface ModernDailyChecklistProps {
  selectedDate: Date;
}

const ModernDailyChecklist = ({ selectedDate }: ModernDailyChecklistProps) => {
  const upliftService = useUpliftService();
  const [todoList, setTodoList] = useState<ITodoList | null>(null);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<ETodoCategory>(
    ETodoCategory.PERSONAL
  );
  const [newTaskPriority, setNewTaskPriority] = useState<ETodoPriority>(
    ETodoPriority.MEDIUM
  );

  // Load todo list for the selected date
  useEffect(() => {
    const loadTodoList = async () => {
      setLoading(true);
      try {
        const list = await upliftService.getTodoList(selectedDate);
        setTodoList(list);
      } catch (error) {
        console.error('Error loading todo list:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodoList();
  }, [selectedDate, upliftService]);

  const handleToggleTask = async (itemId: string, completed: boolean) => {
    try {
      await upliftService.updateTodoItem(selectedDate, itemId, { completed });
      // Reload the list to get updated completion percentages
      const updatedList = await upliftService.getTodoList(selectedDate);
      setTodoList(updatedList);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (itemId: string) => {
    try {
      await upliftService.deleteTodoItem(selectedDate, itemId);
      const updatedList = await upliftService.getTodoList(selectedDate);
      setTodoList(updatedList);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await upliftService.addTodoItem(selectedDate, {
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        category: newTaskCategory,
        labels: [],
      });

      // Reload the list
      const updatedList = await upliftService.getTodoList(selectedDate);
      setTodoList(updatedList);

      // Reset form
      setNewTaskTitle('');
      setNewTaskCategory(ETodoCategory.PERSONAL);
      setNewTaskPriority(ETodoPriority.MEDIUM);
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const getCategoryColor = (category: ETodoCategory) => {
    switch (category) {
      case ETodoCategory.FITNESS:
        return '#4CAF50';
      case ETodoCategory.NUTRITION:
        return '#FF9800';
      case ETodoCategory.MEDITATION:
        return '#9C27B0';
      case ETodoCategory.LEARNING:
        return '#2196F3';
      case ETodoCategory.WORK:
        return '#F44336';
      case ETodoCategory.SOCIAL:
        return '#E91E63';
      case ETodoCategory.PERSONAL:
        return '#795548';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: ETodoPriority) => {
    switch (priority) {
      case ETodoPriority.HIGH:
        return 'error';
      case ETodoPriority.MEDIUM:
        return 'warning';
      case ETodoPriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography>Loading tasks...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="600">
                Daily Tasks
              </Typography>
              {todoList && (
                <Typography variant="body2" color="text.secondary">
                  {todoList.completedItems} of {todoList.totalItems} completed
                  {todoList.totalItems > 0 &&
                    ` (${Math.round(todoList.completionPercentage)}%)`}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Add Task
            </Button>
          </Box>

          {!todoList || todoList.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No tasks for this day. Add a task to get started!
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {todoList.items.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: item.completed
                      ? 'action.hover'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTask(item.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => handleToggleTask(item.id, !item.completed)}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        checked={item.completed}
                        onChange={() =>
                          handleToggleTask(item.id, !item.completed)
                        }
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography
                            sx={{
                              textDecoration: item.completed
                                ? 'line-through'
                                : 'none',
                              opacity: item.completed ? 0.6 : 1,
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              backgroundColor:
                                getCategoryColor(item.category) + '20',
                              color: getCategoryColor(item.category),
                              fontSize: '0.75rem',
                              height: 20,
                            }}
                          />
                          <Chip
                            label={item.priority}
                            size="small"
                            color={getPriorityColor(item.priority)}
                            sx={{ fontSize: '0.75rem', height: 20 }}
                          />
                        </Box>
                      }
                      secondary={item.description}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTaskCategory}
                onChange={(e) =>
                  setNewTaskCategory(e.target.value as ETodoCategory)
                }
                label="Category"
              >
                {Object.values(ETodoCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTaskPriority}
                onChange={(e) =>
                  setNewTaskPriority(e.target.value as ETodoPriority)
                }
                label="Priority"
              >
                {Object.values(ETodoPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModernDailyChecklist;
