import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Grid,
  Box,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  FormControlLabel,
  Switch,
  Chip,
  Collapse,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IFixedExpense } from '@shared/models/finances';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { CurrencyField } from 'src/components/forms';
import { formatCurrency, normalizeObjectDates, toDayjs } from 'src/utils';
import * as yup from 'yup';
import { yupDayjs } from 'src/yup';

interface Props {
  onSubmit: (data: IFixedExpense[]) => void;
  data: IFixedExpense[];
  disabled?: boolean;
}

const FixedExpenseEditDialog = ({ onSubmit, data }: Props) => {
  const schema = yup.object().shape({
    expenses: yup.array().of(
      yup.object().shape({
        name: yup
          .string()
          .nonNullable()
          .required('This field is required')
          .max(64),
        amount: yup
          .number()
          .nonNullable()
          .required('This field is required')
          .typeError('This field is required')
          .moreThan(-1),
        expenseType: yup
          .string()
          .nonNullable()
          .oneOf(
            ['primary', 'secondary', 'single', 'investment'],
            'Invalid type'
          )
          .required('This field is required'),
        date: yupDayjs.nonNullable(),
      })
    ),
  });

  const [open, setOpen] = useState(false);

  // System assets for investment expenses
  const systemAssets = [
    { symbol: 'HUMEX-YIELD', name: 'HumEx Yield Fund' },
    { symbol: 'HUMEX-GROWTH', name: 'HumEx Growth Fund' },
    { symbol: 'HUMEX-STABLE', name: 'HumEx Stable Fund' },
  ];

  // Mock portfolios - in real app, fetch from usePortfolio hook
  const mockPortfolios = [
    { id: 'portfolio-1', name: 'Main Investment Portfolio' },
    { id: 'portfolio-2', name: 'Retirement Fund' },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      expenses: normalizeObjectDates<IFixedExpense[]>(data, toDayjs),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expenses',
  });

  const [indexToEdit, setIndexToEdit] = useState(0);

  useEffect(() => {
    if (open) {
      setValue(
        'expenses',
        normalizeObjectDates<IFixedExpense[]>(
          data.sort((x) => x.amount).reverse(),
          toDayjs
        )
      );
      setIndexToEdit(0);
    }
  }, [data, setValue, open]);

  const expenses = watch('expenses');

  function _handleSubmit(_data: any) {
    if (!_data.expenses) return;

    setOpen(false);
    onSubmit(_data.expenses as IFixedExpense[]);
  }

  function handleOnNewExpense() {
    append({
      amount: 0,
      expenseType: 'primary',
      name: `Fixed Expense ${fields.length + 1}`,
    } as any); // Type assertion for form handling
    setIndexToEdit(fields.length);
  }

  function onRemove(index: number) {
    setIndexToEdit((prev) => {
      const expensesCount = (expenses?.length ?? 0) - 1;
      if (expensesCount === 1) return 0;
      if (prev === index && index === expensesCount) return prev - 1;
      if (prev > index) return prev - 1;
      return prev;
    });

    remove(index);
  }

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        aria-label="Edit fixed expenses"
      >
        <EditIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        component={'form'}
        closeAfterTransition={false}
        onSubmit={handleSubmit(_handleSubmit)}
        {...{ autoComplete: 'off' }}
      >
        <DialogTitle
          sx={{
            textTransform: 'capitalize',
          }}
        >
          Fixed Expenses
        </DialogTitle>
        <DialogContent>
          <Stack gap={4}>
            <Grid container spacing={2}>
              <Grid size={6}>
                {expenses?.length ? (
                  <Card variant={'outlined'}>
                    <CardContent key={`${indexToEdit}_${expenses?.length}`}>
                      <Controller
                        name={`expenses.${indexToEdit}.name`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Name"
                            fullWidth
                            error={!!errors?.expenses?.[indexToEdit]?.name}
                            helperText={
                              errors?.expenses?.[indexToEdit]?.name?.message
                            }
                            slotProps={{
                              htmlInput: {
                                maxLength: 64,
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name={`expenses.${indexToEdit}.amount`}
                        control={control}
                        render={({ field }) => (
                          <CurrencyField
                            {...field}
                            label={'Amount'}
                            fullWidth
                            error={!!errors?.expenses?.[indexToEdit]?.amount}
                            helperText={
                              errors?.expenses?.[indexToEdit]?.amount?.message
                            }
                            slotProps={{
                              htmlInput: {
                                min: 0,
                              },
                            }}
                          />
                        )}
                      />

                      <Stack direction={'row'} gap={2}>
                        <Controller
                          name={`expenses.${indexToEdit}.expenseType`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={'Type'}
                              fullWidth
                              select
                              error={
                                !!errors?.expenses?.[indexToEdit]?.expenseType
                              }
                              helperText={
                                errors?.expenses?.[indexToEdit]?.expenseType
                                  ?.message
                              }
                            >
                              <MenuItem value="single">Single</MenuItem>
                              <MenuItem value="primary">Primary</MenuItem>
                              <MenuItem value="secondary">Secondary</MenuItem>
                              <MenuItem value="investment">
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  Investment
                                  <Chip
                                    size="small"
                                    label="Auto"
                                    color="primary"
                                  />
                                </Box>
                              </MenuItem>
                            </TextField>
                          )}
                        />
                        <Controller
                          name={`expenses.${indexToEdit}.date`}
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              value={field.value ?? null}
                              slotProps={{
                                textField: {
                                  variant: 'filled',
                                  margin: 'dense',
                                  size: 'small',
                                  fullWidth: true,
                                  error:
                                    !!errors?.expenses?.[indexToEdit]?.date,
                                  helperText:
                                    errors?.expenses?.[indexToEdit]?.date
                                      ?.message,
                                },
                              }}
                              label={'Date'}
                              views={['year', 'month', 'day']}
                            />
                          )}
                        />
                      </Stack>

                      {/* Portfolio Investment Configuration */}
                      {expenses?.[indexToEdit]?.expenseType ===
                        'investment' && (
                        <Collapse in={true}>
                          <Card
                            variant="outlined"
                            sx={{ mt: 2, bgcolor: 'primary.50' }}
                          >
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                Investment Configuration (Preview)
                              </Typography>

                              <Alert severity="info" sx={{ mb: 2 }}>
                                This will create automatic monthly transactions
                                that require admin approval.
                              </Alert>

                              <Stack spacing={2}>
                                {/* Portfolio Selection */}
                                <TextField
                                  select
                                  label="Target Portfolio"
                                  value=""
                                  fullWidth
                                  disabled
                                  helperText="Will be available when portfolio configuration is implemented"
                                >
                                  {mockPortfolios.map((portfolio) => (
                                    <MenuItem
                                      key={portfolio.id}
                                      value={portfolio.id}
                                    >
                                      {portfolio.name}
                                    </MenuItem>
                                  ))}
                                </TextField>

                                {/* Asset Selection */}
                                <TextField
                                  select
                                  label="HumEx Product"
                                  value=""
                                  fullWidth
                                  disabled
                                  helperText="System assets integration coming soon"
                                >
                                  {systemAssets.map((asset) => (
                                    <MenuItem
                                      key={asset.symbol}
                                      value={asset.symbol}
                                    >
                                      {asset.symbol} - {asset.name}
                                    </MenuItem>
                                  ))}
                                </TextField>

                                {/* Investment Settings */}
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={true}
                                      disabled
                                      color="primary"
                                    />
                                  }
                                  label="Active (will generate transactions)"
                                />

                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <Chip
                                    label="Auto-Execute Monthly"
                                    color="primary"
                                    size="small"
                                  />
                                  <Chip
                                    label="Requires Admin Approval"
                                    color="warning"
                                    size="small"
                                  />
                                  <Chip
                                    label="System Assets Only"
                                    color="info"
                                    size="small"
                                  />
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Collapse>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant={'outlined'}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        There are no fixed expenses defined yet.
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid size={6}>
                <List sx={{ py: 0 }} dense>
                  {expenses?.map((x, i) => (
                    <ListItem key={i}>
                      <ListItemButton
                        sx={{ borderRadius: 2 }}
                        selected={i === indexToEdit}
                        onClick={() => setIndexToEdit(i)}
                      >
                        <ListItemText
                          primary={
                            x.name ? (
                              x.name
                            ) : (
                              <Box color={'error.main'}>Not Defined</Box>
                            )
                          }
                          secondary={formatCurrency(x.amount)}
                        />
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(i);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Stack direction={'row'} justifyContent={'flex-end'} p={2}>
                  <Button startIcon={<AddIcon />} onClick={handleOnNewExpense}>
                    Add Expense
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FixedExpenseEditDialog;
