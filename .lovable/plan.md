

## Design Spacing, Typography, and Layout Improvements

This plan addresses five key areas: persistent logo + "TALENT MAP" in the header, always-visible dark/light toggle, persistent copyright footer, increased spacing and font sizes, and text visibility review.

### 1. Header: Logo + "TALENT MAP" always visible on all pages

The desktop Header currently shows breadcrumbs on the left (no logo). The logo only appears on mobile. We will add the Garnier logo + "TALENT MAP" text to the left side of the header on all screen sizes, followed by the breadcrumbs.

**File: `src/components/layout/Header.tsx`**
- Add the logo image (`h-16`, with `dark:invert`) and "TALENT MAP" text as the first element inside the header's left section, visible on all breakpoints (not just mobile)
- Keep breadcrumbs after the logo on desktop
- The dark/light mode toggle is already in the header -- no change needed there

### 2. Dark/Light Mode Toggle -- already always present

The `ThemeToggle` component is already rendered in the `Header` on all internal pages and in `AuthLayout` for login/register. No changes needed.

### 3. Persistent Copyright Footer on all internal pages

**File: `src/components/layout/AppLayout.tsx`**
- Add a footer element below the `<main>` content area with: `"(c) Grupo Garnier. All rights reserved."` (no year)
- The footer will respect the sidebar offset (same `pl-16`/`pl-64` logic as `<main>`)
- Use small muted text, centered

### 4. Increase Spacing and Font Sizes by ~30%

**File: `src/index.css`** -- Add a global base font-size increase:
- Set `html { font-size: 18px; }` (up from the default 16px, which is roughly a 12.5% increase at the root) combined with bumping specific text sizes in components. This ensures all `rem`-based sizing scales up.

**File: `src/components/layout/AppLayout.tsx`**
- Increase main content padding from `p-4 md:p-6 lg:p-8` to `p-6 md:p-8 lg:p-10`

**Key pages to update spacing/font sizes:**

- **Directory page** (`src/pages/Directory.tsx`): Increase `space-y-6` to `space-y-8`, heading from `text-3xl` to `text-4xl`, grid gap from `gap-4` to `gap-6`
- **Profile Create** (`src/pages/ProfileCreate.tsx`): Increase step container padding and heading sizes
- **Profile View** (`src/pages/ProfileView.tsx`): Increase section spacing
- **Admin dashboards** (`MasterDashboard.tsx`, `OrganizerDashboard.tsx`, `DirectorDashboard.tsx`): Increase heading sizes and card spacing
- **Sidebar** (`src/components/layout/Sidebar.tsx`): Increase nav item padding from `py-2.5` to `py-3`, text sizes
- **Header** (`src/components/layout/Header.tsx`): Increase height from `h-16` to `h-20`, header padding

### 5. Text Visibility and Truncation Review

- **Sidebar**: The `truncate` class on nav labels and user name can cut text. Will increase sidebar expanded width from `w-64` to `w-72` and ensure `overflow-visible` for key labels.
- **Header breadcrumbs**: Increase font size from `text-sm` to `text-base`
- **Profile cards**: Ensure position/department text wraps instead of truncating
- **Directory search/sort controls**: Increase input/select widths

---

### Technical Summary of Files to Edit

| File | Changes |
|---|---|
| `src/index.css` | Set base `font-size: 18px` on `html` |
| `src/components/layout/Header.tsx` | Add logo+TALENT MAP for all breakpoints, increase height to `h-20`, bigger breadcrumb text |
| `src/components/layout/AppLayout.tsx` | Add copyright footer, increase main padding, adjust sidebar offset for new header height (`pt-20`) |
| `src/components/layout/Sidebar.tsx` | Increase width to `w-72`, bigger nav item padding/text, taller logo header to match `h-20` |
| `src/pages/Directory.tsx` | Increase spacing and heading sizes |
| `src/pages/ProfileCreate.tsx` | Increase spacing |
| `src/pages/ProfileView.tsx` | Increase spacing |
| `src/pages/admin/MasterDashboard.tsx` | Increase heading/spacing |
| `src/pages/admin/OrganizerDashboard.tsx` | Increase heading/spacing |
| `src/pages/admin/DirectorDashboard.tsx` | Increase heading/spacing |
| `src/components/directory/ProfileCard.tsx` | Allow text wrapping |

No functionality, navigation, or logic will be changed -- only visual/layout adjustments.

