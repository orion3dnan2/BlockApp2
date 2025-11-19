# Block System - Design Guidelines

## Design Approach: Enterprise Admin System

**Selected Approach:** Design System (Material Design adapted for Arabic administrative interfaces)

**Justification:** This is a data-heavy administrative system requiring consistency, clarity, and efficiency over visual flair. The focus is on rapid data entry, clear information hierarchy, and reliable CRUD operations.

**Key Principles:**
- Clarity over creativity: Every element serves a functional purpose
- Consistency: Predictable patterns across all admin pages
- Efficiency: Minimize clicks and cognitive load for daily administrative tasks
- Arabic-first: RTL is the primary layout direction, not an adaptation

---

## Typography

**Font Selection:**
- Primary: "Cairo" or "Tajawal" from Google Fonts - excellent Arabic readability with modern geometric structure
- Fallback: system-ui, -apple-system for performance

**Type Scale:**
- Page titles: text-2xl to text-3xl, font-semibold
- Section headers: text-xl, font-medium
- Form labels: text-sm, font-medium
- Body text: text-base
- Table content: text-sm for data density
- Buttons: text-sm, font-medium

**Critical:** All text must maintain excellent legibility at smaller sizes due to data-dense tables and forms.

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 to p-6
- Section gaps: gap-4 to gap-6
- Form field spacing: space-y-4
- Table cell padding: px-4 py-3

**Grid Structures:**
- Dashboard buttons: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Search form: 2-4 column responsive grid for filter fields
- Action buttons: Horizontal flex layouts with gap-3

**Container Strategy:**
- Dashboard: max-w-7xl mx-auto with px-4 to px-6
- Forms and tables: Full-width within container with proper padding
- Modals/dialogs: max-w-2xl for forms, max-w-4xl for data preview

---

## Component Library

### Navigation & Header
- Top navigation bar: Fixed header with system title on right (RTL), user info on left
- User profile: Small avatar + name with dropdown for settings/logout
- Breadcrumbs: Not needed for this 2-level navigation structure

### Dashboard Cards/Buttons
- Large clickable card buttons (not traditional small buttons)
- Each card: Minimum h-32, rounded corners, shadow on hover
- Icon + Arabic label vertically centered
- 6 cards total in responsive grid: التقارير، الاستعلام، المستخدمين، عمليات البلاغات، النسخة الاحتياطية، خروج

### Forms & Inputs
- **Standard fields:** Outlined input style with visible borders, rounded corners
- **Red-highlighted fields:** Distinct red border (border-red-500) for رقم السجل, رقم السجل المدني, ملاحظات إضافية
- Label positioning: Above input (RTL-friendly)
- Required indicators: Red asterisk after label
- Date pickers: Calendar icon on left (start in RTL), native-looking interface
- Dropdowns: Chevron icon, clear selected state

### Search Interface
- Compact filter bar above table with inline form fields
- Small action buttons next to each relevant field: "بحث" (primary), "جديد" (secondary)
- Collapsible advanced filters if needed (though all filters visible initially per requirements)

### Data Tables
- Striped rows for readability (subtle background alternation)
- Sticky header when scrolling
- Column headers: Clickable for sorting with sort indicators
- Row actions: Icon buttons for edit/delete at row end (right side in RTL)
- Pagination: Bottom center, showing "عرض X-Y من Z نتيجة"
- Row hover state: Subtle background highlight
- Empty state: Centered message with icon when no data

### Action Buttons
- Primary actions (حفظ، بحث): Solid background, prominent
- Secondary actions (تعديل، جديد): Outlined style
- Destructive (حذف): Red variant
- Exit (خروج): Neutral/gray
- Button group at bottom of forms: Flexbox with gap-3, justify-start (RTL right-aligned)

### Modals & Dialogs
- Confirmation dialogs for delete operations
- Form modals for adding/editing records
- Overlay with backdrop blur
- Close button at top-left (RTL perspective)

### Alerts & Notifications
- Toast notifications: Top-right corner (RTL top-left)
- Success: Green, Error: Red, Warning: Yellow, Info: Blue
- Form validation errors: Inline below fields with red text

---

## RTL Implementation Critical Points

**Direction:** All containers use `dir="rtl"` at root level

**Text Alignment:**
- Default text-right for all content
- Tables and forms maintain right-to-left flow
- Numbers: Can remain LTR within RTL context for clarity (e.g., phone numbers, IDs)

**Icon Placement:**
- Search icons: Right side of input fields
- Dropdown chevrons: Left side
- Action buttons in tables: Rightmost column
- Back/navigation arrows: Flipped (← becomes →)

**Spacing Adjustments:**
- mr-* becomes ml-* equivalents
- pr-* becomes pl-* equivalents
- All flexbox justify and align properties account for RTL

---

## Color Strategy (Structure Only)

Since color specification is deferred, establish semantic structure:
- Primary: Main actions, active states
- Secondary: Supporting actions
- Danger: Delete, errors, red-highlighted fields
- Success: Save confirmations, success messages
- Neutral: Table backgrounds, borders, disabled states
- Surface: Card backgrounds, modal overlays

---

## Images

**Image Usage:** Minimal to none - this is a data-centric administrative system

**Logo:** Small system logo/icon in header if needed (32x32 to 48x48 px)

**Empty States:** Simple illustrative icons (via icon library) for empty tables/no results, not full images

**User Avatars:** Small circular avatars (40x40 px) in header - placeholder initials if no photo

**No Hero Images:** Dashboard is functional grid - no decorative hero sections

---

## Data Density & Hierarchy

**Information Priority:**
1. Critical data fields (red-highlighted) most prominent
2. Primary actions easily accessible
3. Secondary information available but not dominant
4. Support features (export, backup) present but non-intrusive

**Visual Weight:**
- Tables: Highest information density - compact but readable
- Forms: Medium density - clear field separation
- Dashboard: Lowest density - large touchable targets

---

This design ensures an efficient, professional Arabic administrative interface optimized for daily data management tasks.