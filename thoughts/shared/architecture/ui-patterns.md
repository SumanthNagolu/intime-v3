# UI Patterns & Components

This document defines the UI patterns, component conventions, and design system for the InTime platform.

## Component Library

We use **shadcn/ui** components as our base. All components are in `src/components/ui/`.

### Available Components
```
src/components/ui/
├── button.tsx
├── input.tsx
├── select.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── table.tsx
├── tabs.tsx
├── card.tsx
├── badge.tsx
├── toast.tsx
└── ... (see directory for full list)
```

## Page Layout Patterns

### Standard Page Structure
```tsx
// src/app/employee/{module}/{page}/page.tsx
export default function PageName() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Page Title</h1>
          <p className="text-muted-foreground">Description</p>
        </div>
        <div className="flex gap-2">
          {/* Action buttons */}
        </div>
      </div>

      {/* Page Content */}
      <div>
        {/* Main content here */}
      </div>
    </div>
  );
}
```

### Detail Page with Tabs
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="details">...</TabsContent>
  <TabsContent value="history">...</TabsContent>
</Tabs>
```

## Component Patterns

### Data Tables
Use the table component with consistent patterns:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell><StatusBadge status={item.status} /></TableCell>
        <TableCell className="text-right">
          <ActionsDropdown item={item} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Forms
Use React Hook Form with Zod validation:
```tsx
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... },
});

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  </Form>
);
```

### Dialogs/Modals
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Status Badges

Consistent status representation:
```tsx
const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
};

<Badge className={statusColors[status]}>{status}</Badge>
```

## Loading States

### Page Loading
```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
```

### Button Loading
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Save
</Button>
```

## Error States

### Error Display
```tsx
if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```

## Empty States

```tsx
if (items.length === 0) {
  return (
    <div className="text-center py-12">
      <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-lg font-medium">No items found</h3>
      <p className="mt-1 text-muted-foreground">
        Get started by creating a new item.
      </p>
      <Button className="mt-4" onClick={onCreate}>
        Create Item
      </Button>
    </div>
  );
}
```

## Naming Conventions

### Files
- Components: PascalCase (`CampaignCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Hooks: camelCase with `use` prefix (`useJobs.ts`)

### Components
- Use descriptive names: `CampaignDetailPage`, `JobListTable`, `CandidateCard`
- Suffix with type: `*Dialog`, `*Form`, `*Table`, `*Card`

## Module Organization

```
src/components/{module}/
├── {Module}ListPage.tsx      # List view
├── {Module}DetailPage.tsx    # Detail view
├── {Module}Form.tsx          # Create/Edit form
├── {Module}Card.tsx          # Card representation
├── {Module}Table.tsx         # Table component
├── dialogs/                  # Module-specific dialogs
│   ├── Create{Module}Dialog.tsx
│   └── Edit{Module}Dialog.tsx
└── sections/                 # Detail page sections
    ├── OverviewSection.tsx
    └── HistorySection.tsx
```

## Adding New Components

When adding a new component:
1. Check if shadcn/ui has a base component to extend
2. Follow existing naming conventions
3. Use TypeScript with proper types
4. Include loading and error states
5. Make it responsive (mobile-first)
6. Update this document if introducing new patterns

---

**Last Updated**: 2025-12-08
**Maintainer**: Development Team

