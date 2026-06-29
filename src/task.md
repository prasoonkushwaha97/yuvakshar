# Yuvakshar Production Integration Sprint — TODO Checklist

- [x] Article Integration
  - [x] Map legacy `/editorial?id=` links to `/articles/[slug]` in category lists.
  - [x] Map links in community authors profiles, bookmarks, and search result lists.
  - [x] Refactor `MetaInfo.tsx` and `ShareButton.tsx` to support the article slug and build public URLs.
- [x] Author Integration
  - [x] Wrap author avatar and name in `MetaInfo.tsx` with a Link pointing to `/authors/[slug]`.
  - [x] Link columnists in `EditorialCard.tsx` to their `/authors/[slug]` pages.
  - [x] Link author details inside `AuthorCard.tsx` to `/authors/[slug]` pages.
- [x] Category Integration
  - [x] Refactor `/category/[slug]/page.tsx` to dynamically map category names using database entries in `CmsContext.tsx`.
- [x] E2E Build Validation
  - [x] Run `npm run build` to confirm zero compilation warnings or typecheck failures.
