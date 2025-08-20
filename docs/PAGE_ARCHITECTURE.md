# Page Architecture Guidelines

## Standard Page Structure

Every page in the portal should follow this consistent pattern:

### File Organization

```
PageName/
├── Page.tsx                    # Main page component
├── README.md                   # Architecture documentation
├── _components/
│   ├── index.ts               # Barrel exports
│   ├── PageNameHeader.tsx     # Page header component
│   ├── PageNameContent.tsx    # Main content component
│   └── [SpecificComponents]   # Page-specific components
```

### Component Responsibilities

#### **Page.tsx** (Main Container)

- **Data Fetching**: Firebase queries, API calls
- **State Management**: Page-level state, loading, errors
- **Navigation**: URL params, routing logic
- **Layout**: Basic page structure and responsive design

```typescript
const Page = () => {
  // 1. Data fetching
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Page logic
  const handleUserActions = () => { /* ... */ };

  // 3. Render structure
  return (
    <PageLayout>
      <PageNameHeader {...headerProps} />
      <PageNameContent {...contentProps} />
    </PageLayout>
  );
};
```

#### **PageNameHeader.tsx** (Page Header)

- **Title & Breadcrumbs**: Page identification
- **Primary Actions**: Add, filter, sort buttons
- **Summary Stats**: Key metrics, totals
- **Navigation**: Tab switching, time filters

```typescript
interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  stats?: StatItem[];
}
```

#### **PageNameContent.tsx** (Main Content)

- **Data Display**: Tables, charts, cards
- **User Interactions**: Forms, modals, selections
- **Content Organization**: Sections, tabs, accordions

## Implementation Examples

### ✅ **Good Example: Portfolio Page**

```
Portfolio/
├── Page.tsx                    # Portfolio data + state
├── _components/
│   ├── PortfolioHeader.tsx    # Title, value, P&L
│   ├── HoldingsTable.tsx      # Investment data
│   ├── ActivityTable.tsx      # Transaction history
│   └── PortfolioChart.tsx     # Performance visualization
```

### ✅ **Good Example: Dashboard Page**

```
Dashboard/
├── Page.tsx                   # Dashboard data + layout
├── _components/
│   ├── DashboardHeader.tsx   # Welcome, stats
│   ├── DashboardContent.tsx  # Main grid layout
│   ├── MetricCard.tsx        # Individual metrics
│   └── QuickActions.tsx      # Common actions
```

### ❌ **Avoid: Monolithic Pages**

```
Portfolio.tsx  // Everything in one 1000+ line file
```

### ❌ **Avoid: Over-fragmentation**

```
Portfolio/
├── Page.tsx
├── Header/
│   ├── Title.tsx          # Too granular
│   ├── Breadcrumbs.tsx    # Too granular
│   └── Actions.tsx        # Too granular
```

## State Management Patterns

### **Local State** (Most Common)

```typescript
// In Page.tsx
const [selectedTab, setSelectedTab] = useState('overview');
const [sortBy, setSortBy] = useState('date');
const [filters, setFilters] = useState({});
```

### **Context State** (Cross-component)

```typescript
// For complex pages with deep prop drilling
const PageContext = createContext();
```

### **Global State** (Cross-page)

```typescript
// Use existing AuthContext, ThemeContext
const { user, isAdmin } = useAuth();
```

## Data Fetching Patterns

### **Firebase Integration**

```typescript
// Standard pattern
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await db.collection('path').get();
      setData(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [dependencies]);
```

### **Real-time Updates**

```typescript
// For live data
useEffect(() => {
  const unsubscribe = db.collection('path').onSnapshot((snapshot) => {
    setData(snapshot.docs.map((doc) => doc.data()));
  });

  return unsubscribe;
}, []);
```

## When to Create README.md Files

### ✅ **Always Create For:**

- Complex pages with multiple components
- Pages with specific data flow patterns
- Pages with unique business logic
- Admin or specialized functionality

### ✅ **Consider Creating For:**

- Reusable component patterns
- API integration approaches
- State management strategies

### ❌ **Don't Create For:**

- Simple static pages
- Standard CRUD operations
- Already well-documented patterns

## Documentation Template

```markdown
# [Page Name] Architecture

## Purpose

Brief description of what this page does

## Component Structure

File organization and responsibilities

## Data Flow

How data moves through the components

## Key Features

Special functionality or patterns

## Performance Considerations

Optimizations and considerations

## Future Enhancements

Planned improvements or known limitations
```

This approach helps maintain consistency, makes onboarding easier, and serves as living documentation that evolves with your code!
