# UI Design System - Admin Portal

**Version:** 1.0
**Last Updated:** 2025-12-04
**Framework:** Mantine v7

This document defines the UI component patterns and design tokens for all Admin portal screens. All admin specs should reference these components to ensure consistency across the application.

---

## Color Tokens

### Primary Palette

| Context | Color Name | Token | Hex | Usage |
|---------|------------|-------|-----|-------|
| Primary Actions | Forest Green | `--mantine-color-brand-6` | #2D5016 | Primary buttons, active states |
| Primary Hover | Forest Green Dark | `--mantine-color-brand-7` | #1E3A0F | Hover state for primary |
| Primary Light | Forest Green Light | `--mantine-color-brand-1` | #E8F5E0 | Backgrounds, highlights |

### Semantic Colors

| Context | Color Name | Token | Hex | Usage |
|---------|------------|-------|-----|-------|
| Destructive Actions | Rust Red | `--mantine-color-rust-6` | #E07A5F | Delete, deactivate buttons |
| Warning States | Goldenrod | `--mantine-color-gold-6` | #FFD700 | Warnings, pending states |
| Info/Links | Ocean Blue | `--mantine-color-ocean-6` | #1E3A5F | Links, info alerts |
| Success | Green | `--mantine-color-green-6` | #40C057 | Success messages, active status |

### Status Colors

| Status | Color | Token | Usage |
|--------|-------|-------|-------|
| Active | Green | `green.6` | Active users, enabled features |
| Inactive | Gray | `gray.5` | Inactive users, disabled items |
| Pending | Yellow | `yellow.6` | Pending invitations, processing |
| Locked | Red | `red.6` | Locked accounts, errors |
| Warning | Orange | `orange.6` | Warnings, approaching limits |

---

## Typography

### Font Stack

```typescript
fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
fontFamilyMonospace: 'Monaco, Menlo, Consolas, "Ubuntu Mono", monospace'
```

### Text Sizes

| Size | Token | Usage |
|------|-------|-------|
| xs | `12px` | Labels, captions, helper text |
| sm | `14px` | Body text, table cells |
| md | `16px` | Default, form inputs |
| lg | `18px` | Section headers |
| xl | `20px` | Page titles, metrics |
| 2xl | `24px` | Dashboard metrics |
| 3xl | `30px` | Large dashboard numbers |

### Font Weights

| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `normal` | Body text |
| 500 | `medium` | Labels, emphasis |
| 600 | `semibold` | Headers, important values |
| 700 | `bold` | Page titles, metrics |

---

## Layout Components

### AppShell Configuration

```typescript
<AppShell
  layout="default"
  navbar={{
    width: 260,
    breakpoint: 'sm',
    collapsed: { mobile: !opened, desktop: false }
  }}
  header={{ height: 60 }}
  padding="md"
>
  <AppShell.Header>
    {/* Header content */}
  </AppShell.Header>
  <AppShell.Navbar>
    {/* Sidebar navigation */}
  </AppShell.Navbar>
  <AppShell.Main>
    {/* Page content */}
  </AppShell.Main>
</AppShell>
```

### Container

```typescript
// Page container
<Container size="xl" py="md">
  {/* Page content */}
</Container>

// Section container
<Container size="lg" py="sm">
  {/* Section content */}
</Container>
```

### Grid System

```typescript
// Two column layout
<Grid>
  <Grid.Col span={8}>Main content</Grid.Col>
  <Grid.Col span={4}>Sidebar</Grid.Col>
</Grid>

// Three column dashboard
<Grid>
  <Grid.Col span={4}>Widget 1</Grid.Col>
  <Grid.Col span={4}>Widget 2</Grid.Col>
  <Grid.Col span={4}>Widget 3</Grid.Col>
</Grid>

// Responsive grid
<Grid>
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>Responsive item</Grid.Col>
</Grid>
```

---

## Button Components

### Primary Button (Actions)

```typescript
<Button
  variant="filled"
  color="brand"
  leftSection={<IconPlus size={16} />}
>
  Create User
</Button>
```

**Usage:** Primary actions like Save, Create, Submit

### Secondary Button (Cancel/Back)

```typescript
<Button variant="outline">
  Cancel
</Button>
```

**Usage:** Secondary actions like Cancel, Back, Close

### Danger Button (Destructive)

```typescript
<Button
  variant="filled"
  color="red"
  leftSection={<IconTrash size={16} />}
>
  Delete
</Button>
```

**Usage:** Destructive actions like Delete, Deactivate, Remove

### Light Button (Tertiary)

```typescript
<Button
  variant="light"
  leftSection={<IconDownload size={16} />}
>
  Export
</Button>
```

**Usage:** Less prominent actions like Export, Filter, View

### Button Group

```typescript
<Button.Group>
  <Button variant="default">View</Button>
  <Button variant="default">Edit</Button>
  <Button variant="filled" color="brand">Save</Button>
</Button.Group>
```

---

## Form Components

### Text Input

```typescript
<TextInput
  label="First Name"
  placeholder="Enter first name"
  withAsterisk // for required fields
  error="First name is required"
  description="As it appears on official documents"
/>
```

### Select (Dropdown)

```typescript
<Select
  label="Role"
  placeholder="Select a role"
  data={[
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'recruiter', label: 'Recruiter' },
  ]}
  searchable
  withAsterisk
/>
```

### Multi-Select

```typescript
<MultiSelect
  label="Permissions"
  placeholder="Select permissions"
  data={permissionOptions}
  searchable
  clearable
/>
```

### Textarea

```typescript
<Textarea
  label="Description"
  placeholder="Enter description"
  minRows={3}
  maxRows={6}
  autosize
/>
```

### DatePicker

```typescript
<DatePickerInput
  label="Start Date"
  placeholder="Select date"
  valueFormat="MMM DD, YYYY"
/>
```

### Checkbox

```typescript
<Checkbox
  label="Require 2FA"
  description="Recommended for admin accounts"
/>
```

### Radio Group

```typescript
<Radio.Group
  label="Account Status"
  value={status}
  onChange={setStatus}
>
  <Radio value="active" label="Active" />
  <Radio value="inactive" label="Inactive" />
</Radio.Group>
```

### Switch

```typescript
<Switch
  label="Enable feature"
  description="Turn this feature on or off"
  checked={enabled}
  onChange={(event) => setEnabled(event.currentTarget.checked)}
/>
```

---

## Table Components

### Data Table

```typescript
<Table.ScrollContainer minWidth={800}>
  <Table striped highlightOnHover>
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Name</Table.Th>
        <Table.Th>Email</Table.Th>
        <Table.Th>Role</Table.Th>
        <Table.Th>Status</Table.Th>
        <Table.Th>Actions</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {data.map((row) => (
        <Table.Tr key={row.id}>
          <Table.Td>{row.name}</Table.Td>
          <Table.Td>{row.email}</Table.Td>
          <Table.Td>{row.role}</Table.Td>
          <Table.Td>
            <Badge color={row.status === 'active' ? 'green' : 'gray'}>
              {row.status}
            </Badge>
          </Table.Td>
          <Table.Td>
            <ActionIcon variant="subtle">
              <IconEdit size={16} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
</Table.ScrollContainer>
```

### Sortable Table Header

```typescript
<Table.Th
  sorted={sortBy === 'name'}
  reversed={reverseSortDirection}
  onSort={() => setSorting('name')}
>
  Name
</Table.Th>
```

---

## Card Components

### Paper (Card Container)

```typescript
<Paper p="md" withBorder shadow="xs" radius="md">
  {/* Card content */}
</Paper>
```

### Metric Card

```typescript
<Paper p="md" withBorder shadow="xs" radius="md">
  <Group justify="space-between">
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        Total Users
      </Text>
      <Text size="xl" fw={700}>
        247
      </Text>
    </div>
    <ThemeIcon size="lg" radius="md" variant="light" color="brand">
      <IconUsers size={20} />
    </ThemeIcon>
  </Group>
</Paper>
```

---

## Modal Components

### Standard Modal

```typescript
<Modal
  opened={opened}
  onClose={close}
  title="Create User"
  centered
  size="lg"
>
  {/* Modal content */}
</Modal>
```

### Confirmation Modal

```typescript
<Modal
  opened={opened}
  onClose={close}
  title="Confirm Delete"
  centered
  size="sm"
>
  <Text>Are you sure you want to delete this user?</Text>
  <Group justify="flex-end" mt="md">
    <Button variant="outline" onClick={close}>Cancel</Button>
    <Button color="red" onClick={handleDelete}>Delete</Button>
  </Group>
</Modal>
```

---

## Alert Components

### Alert Variants

```typescript
// Success
<Alert icon={<IconCheck size={16} />} color="green" title="Success">
  User created successfully
</Alert>

// Warning
<Alert icon={<IconAlertTriangle size={16} />} color="yellow" title="Warning">
  This action cannot be undone
</Alert>

// Error
<Alert icon={<IconX size={16} />} color="red" title="Error">
  Failed to create user
</Alert>

// Info
<Alert icon={<IconInfoCircle size={16} />} color="blue" title="Info">
  Users will receive an email invitation
</Alert>
```

---

## Badge Components

### Status Badges

```typescript
// Active
<Badge color="green" variant="filled">Active</Badge>

// Inactive
<Badge color="gray" variant="filled">Inactive</Badge>

// Pending
<Badge color="yellow" variant="filled">Pending</Badge>

// Locked
<Badge color="red" variant="filled">Locked</Badge>
```

### Role Badges

```typescript
<Badge color="brand" variant="light">Admin</Badge>
<Badge color="ocean" variant="light">Manager</Badge>
<Badge color="gray" variant="light">Recruiter</Badge>
```

---

## Navigation Components

### NavLink (Sidebar)

```typescript
<NavLink
  href="/employee/admin/users"
  label="Users"
  leftSection={<IconUsers size={16} />}
  rightSection={<Badge size="xs">247</Badge>}
  active={pathname === '/employee/admin/users'}
/>
```

### Breadcrumbs

```typescript
<Breadcrumbs>
  <Anchor href="/employee/admin">Admin</Anchor>
  <Anchor href="/employee/admin/users">Users</Anchor>
  <Text>John Smith</Text>
</Breadcrumbs>
```

### Tabs

```typescript
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="permissions">Permissions</Tabs.Tab>
    <Tabs.Tab value="activity">Activity</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="overview">{/* Content */}</Tabs.Panel>
  <Tabs.Panel value="permissions">{/* Content */}</Tabs.Panel>
  <Tabs.Panel value="activity">{/* Content */}</Tabs.Panel>
</Tabs>
```

---

## Loading States

### Skeleton

```typescript
<Skeleton height={50} circle mb="xl" />
<Skeleton height={8} radius="xl" />
<Skeleton height={8} mt={6} radius="xl" />
<Skeleton height={8} mt={6} width="70%" radius="xl" />
```

### Loader

```typescript
<Loader color="brand" size="md" />
```

### Loading Overlay

```typescript
<LoadingOverlay
  visible={loading}
  overlayProps={{ blur: 2 }}
/>
```

---

## Icons

Use icons from `@tabler/icons-react`:

```typescript
import {
  IconUsers,
  IconSettings,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
  IconDownload,
  IconUpload,
  IconSearch,
  IconFilter,
} from '@tabler/icons-react';
```

### Icon Sizes

| Context | Size | Usage |
|---------|------|-------|
| Button icon | `16` | Inside buttons |
| Table action | `16` | Table row actions |
| Navigation | `18` | Sidebar items |
| Card icon | `20` | Card headers |
| Hero icon | `24` | Page headers |
| Large display | `32` | Empty states |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | Tight spacing |
| `sm` | `8px` | Default small |
| `md` | `16px` | Default medium |
| `lg` | `24px` | Section gaps |
| `xl` | `32px` | Large sections |

---

## Z-Index

| Context | Value |
|---------|-------|
| Dropdown | `200` |
| Modal | `300` |
| Tooltip | `400` |
| Notification | `500` |

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `xs` | `576px` | Mobile |
| `sm` | `768px` | Tablet portrait |
| `md` | `992px` | Tablet landscape |
| `lg` | `1200px` | Desktop |
| `xl` | `1400px` | Large desktop |

---

## ASCII Wireframe Reference

When creating ASCII wireframes in specs, use these characters:

```
+---+  Box corners and borders
|   |  Vertical borders
---    Horizontal borders
┌───┐  Rounded corners (inner elements)
│   │
└───┘
▼      Dropdown indicator
[x]    Close button
[Button] Button
(___)  Input field
○ ●    Radio buttons (unselected/selected)
☐ ☑    Checkboxes (unchecked/checked)
←→     Navigation arrows
...    Truncated content
```

### Example Screen Layout

```
+----------------------------------------------------------+
| Page Title                            [Action] [Action]   |
+----------------------------------------------------------+
| [Search...                         ] [Filter ▼] [Export]  |
+----------------------------------------------------------+
|                                                          |
| SECTION HEADER                                           |
| ┌────────────┐ ┌────────────┐ ┌────────────┐            |
| │   Value    │ │   Value    │ │   Value    │            |
| │   Label    │ │   Label    │ │   Label    │            |
| └────────────┘ └────────────┘ └────────────┘            |
|                                                          |
| TABLE                                                    |
| ┌──────┬─────────────┬───────────┬────────────┐         |
| │ Col1 │ Col2        │ Col3      │ Actions    │         |
| ├──────┼─────────────┼───────────┼────────────┤         |
| │ Data │ Data        │ Badge     │ [Edit]     │         |
| │ Data │ Data        │ Badge     │ [Edit]     │         |
| └──────┴─────────────┴───────────┴────────────┘         |
|                                                          |
| [Pagination: < 1 2 3 ... 10 >]                          |
+----------------------------------------------------------+
```

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-04 | Initial UI Design System documentation |

---

**End of UI Design System**
