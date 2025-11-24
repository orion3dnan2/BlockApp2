# نظام إدارة الرقابة والتفتيش - Design Guidelines

## Design Approach
**Governmental Enterprise System** inspired by Material Design principles and modern administrative portals. Professional, formal aesthetic emphasizing trust, authority, and clarity for Arabic government operations.

## Typography System (RTL)
**Primary Font**: Cairo (Google Fonts)
- Page Titles: 2xl/3xl (32-48px), Bold (700)
- Section Headers: xl/2xl (24-32px), SemiBold (600)
- Card Headers: lg (18px), SemiBold (600)
- Body Text: base (16px), Regular (400)
- Small Text/Labels: sm (14px), Medium (500)

## Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16 for consistency
- Section Padding: py-12 md:py-16
- Card Padding: p-6
- Element Gaps: gap-4, gap-6, gap-8
- Container: max-w-7xl with px-4 md:px-8

## Core Components

### Dashboard Header
- Full-width navigation with ministry logo (right-aligned for RTL)
- Primary nav links with government seal icon
- User profile dropdown (left-aligned)
- Notification bell with badge counter
- Height: h-16, shadow-sm

### Hero Section
**Large Governmental Image**: Professional photograph of official government building or inspection team at work (1920x600px), subtle overlay with gradient from navy to transparent
- Headline overlaid: "نظام إدارة الرقابة والتفتيش الإلكتروني"
- Subtitle: Government authority tagline
- Two CTA buttons with backdrop-blur-md backgrounds
- Height: h-96 with object-cover image

### Stats Dashboard Cards (4-column grid on desktop, responsive)
- Elevation: shadow-sm with subtle border
- Icon circle backgrounds in Royal Blue tint
- Large numbers (3xl) with labels below
- Hover: slight shadow-md transition

### Main Content Grid
**Two-column layout** (2/3 main + 1/3 sidebar on lg screens)

**Primary Column**:
- Recent Inspections Table: Striped rows, alternating backgrounds, status badges
- Action Buttons: Bordered pills with icons
- Pending Tasks Cards: Timeline format with connecting vertical lines

**Sidebar**:
- Quick Actions Card: Stacked button list
- Calendar Widget: Month view with highlighted dates
- Notifications Feed: Avatar + text layout

### Data Tables
- Header row with Royal Blue background tint
- Alternating row colors (white/light gray)
- Right-aligned actions column with icon buttons
- Pagination controls centered below

### Forms & Inputs
- Floating labels above inputs
- Consistent h-12 input height
- Subtle borders (border-gray-300) with focus ring in Royal Blue
- Required field indicators (*)
- Help text in small gray below fields

### Navigation Sidebar (collapsible)
- Fixed right side for RTL
- Ministry emblem at top
- Icon + text menu items
- Active state: Royal Blue background with rounded corners
- Collapse to icon-only on mobile

## Card System
**Primary Card**: Rounded corners (rounded-lg), padding p-6, shadow-sm, white background
**Accent Card**: Light gray background with border-l-4 in Royal Blue for highlights
**Interactive Cards**: Hover elevation to shadow-md with smooth transition

## Images
1. **Hero**: Government building or inspection team (official, professional)
2. **Dashboard Widgets**: Small circular avatars for user profiles
3. **Ministry Logo**: SVG format, official governmental seal
4. **Empty States**: Illustrations for "no data" scenarios in light gray tones

## Iconography
**Heroicons** (outline style) via CDN for clean, professional appearance matching governmental formality

## Interactions
- Minimal animations: Focus on instant feedback
- Button states: Subtle opacity changes only
- Loading states: Simple spinner in Royal Blue
- Toast notifications: Top-center, auto-dismiss

## Accessibility
- High contrast maintained throughout
- Clear focus indicators
- ARIA labels in Arabic
- Keyboard navigation support
- Consistent RTL text alignment

## Professional Touches
- Very subtle shadows (shadow-sm primary, shadow-md for elevation)
- Consistent 2px borders where needed
- Official government watermark in footer
- Ministry seal throughout for authority
- Clean, organized layouts reflecting governmental precision