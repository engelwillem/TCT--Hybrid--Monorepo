# **App Name**: TheChoosenTalks

## Core Features:

- Project Initialization: Initialize a new project using React 19, Vite, and TypeScript with an organized folder structure.
- Tailwind CSS v4 Integration: Configure and integrate Tailwind CSS v4 for streamlined, utility-first styling.
- Routing System: Set up application routing using 'react-router-dom' with predefined routes like '/today', '/community', and dynamic parameters for '/versehub/:lang'.
- UI Utility Helper: Implement a `cn()` utility function using 'clsx' and 'tailwind-merge' for efficient conditional class name concatenation.
- App Shell Layout: Design a responsive 'AppShell' layout with a mobile-first container (`max-w-md`) and a full viewport height (`min-h-dvh`).
- Bottom Navigation Bar: Create a bottom navigation component with 'NavLink's for primary routes like Today, Community, Versehub, Inbox, and Profile.
- Placeholder Pages: Generate placeholder content for all defined routes to demonstrate basic navigation and component rendering.
- Button Component: Develop a flexible button component with variants (default, secondary, ghost, outline) and sizes (sm, md, lg, icon) in `src/components/ui/button.tsx`.
- Card Component: Create a reusable card component for displaying grouped content in `src/components/ui/card.tsx`.
- Badge Component: Implement a small, informative badge component for labels or status indicators in `src/components/ui/badge.tsx`.
- Tabs Component: Build a set of accessible tab components (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) for organizing content in `src/components/ui/tabs.tsx`.
- Input and Textarea Components: Develop standardized input field and textarea components for form interactions in `src/components/ui/input.tsx` and `src/components/ui/textarea.tsx`.
- Separator Component: Create a visual separator component to delineate content sections in `src/components/ui/separator.tsx`.
- Sheet Component: Implement a sheet component (side panel or bottom sheet) for overlay content, potentially using Headless UI or a custom portal, in `src/components/ui/sheet.tsx`.
- Avatar Component: Develop an avatar component for user representations, including fallback options, in `src/components/ui/avatar.tsx`.
- Dropdown Menu Component: Create a basic dropdown menu component with trigger, content, and item functionalities in `src/components/ui/dropdown-menu.tsx`.
- Community Page UI Demo: Update the `/community` page to showcase the `Card`, `Tabs`, `Button`, and `Avatar` UI primitives.

## Style Guidelines:

- Primary color: A deep, professional blue (#1E68AD) to represent reliability and a clean tech aesthetic.
- Background color: A soft, almost-white shade of blue (#F6F8F9) that provides a clean, airy canvas for content.
- Accent color: A vibrant teal (#1EC7C7) for interactive elements, highlights, and calls to action, providing a modern contrast.
- Body and headline font: 'Inter' (sans-serif) for its modern, legible, and versatile qualities, suitable for a clean UI framework.
- Utilize simple, clean, and modern line icons to complement the app's professional and minimalistic aesthetic.
- Implement a consistent mobile-first design approach across all UI primitives, adapting smoothly to larger screens with appropriate spacing and alignment.
- Subtle, fast transitions and hover effects to provide smooth user feedback without being distracting, emphasizing responsiveness.
- Ensure clear and discernible focus rings for all interactive UI elements to enhance keyboard navigation and accessibility.