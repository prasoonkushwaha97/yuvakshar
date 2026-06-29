# Mobile Experience Refactor & Navigation Unification — TODO Checklist

- [x] Phase 1: Design Tokens & Configurations
  - [x] Create `designTokens.ts` centralizing colors, radii, shadows, and z-index.
  - [x] Create `navigation.config.ts` mapping primary, profile, and category routes.
- [x] Phase 2: Consolidated Layout Controls
  - [x] Implement `AppDrawer.tsx` (supports navigation/profile modes, Escape-close, and keyboard focus traps).
  - [x] Refactor `Navbar.tsx` and `NewspaperHeader.tsx` into a single, scroll-collapsing `AppHeader.tsx` layout.
  - [x] Refactor `MobileBottomNav.tsx` to read from dynamic configs and enforce safe-area insets.
- [x] Phase 3: Homepage Mobile UX & Card Hardening
  - [x] Implement a fullscreen Search overlay trigger.
  - [x] Unify properties parsing inside all card components to safely resolve snake_case and camelCase parameters.
- [x] Phase 4: Build Verification & Legacy Cleanup
  - [x] Run `npm run build` to confirm zero compilation warnings or hydration issues.
  - [x] Clean up obsolete drawer files, legacy menu imports, and dead code.
  - [x] Verify public/private guest access routing in middleware.
