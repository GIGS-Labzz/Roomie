# Navigation Redesign Plan

## Direction

Replace the current full-width glass navigation with a compact, centered pill inspired by the reference image:

- A black, high-contrast capsule centered horizontally near the top of the page.
- The Roomie icon sits in a small circular control attached to the left edge of the capsule.
- The primary links live inside the central capsule with thin separators.
- The primary action is a second capsule attached to the right edge.
- The overall silhouette should feel like one connected object, while each section remains independently clickable.
- Keep the visual language minimal: black surface, white text, subtle gray borders, no gradients, and restrained shadow.

The redesign should preserve the existing navigation behavior and content. This is a presentation change, not a routing or application-logic change.

## Current Surface

The primary target is:

- `apps/web/src/components/sections/Navbar.tsx`

Current behavior to preserve:

- Fixed positioning at the top of the viewport.
- Auto-hide on downward scroll and return on upward scroll.
- Desktop anchor links for How it works, Why Roomie, and Pricing.
- Waitlist action through `openWaitlist`.
- Mobile menu with animated open/close states.
- Closing the mobile menu when the header hides.

The shared logo is:

- `packages/ui/src/logo.tsx`

The current logo component already supports `showWordmark`. The redesigned navbar should use the icon-only form instead of rendering the `Roomie` wordmark.

## Proposed Desktop Structure

Use a single fixed header with a constrained content area. The centered navigation object should be composed as follows:

```text
[ icon circle ] [ How it works | Why Roomie | Pricing ] [ Get the app ]
```

Implementation shape:

1. Keep the outer `motion.header` responsible for fixed positioning, z-index, and scroll hide/show animation.
2. Replace the current full-width glass bar with a transparent outer shell and a centered flex row.
3. Render `<Logo href="/" size="sm" showWordmark={false} />` as the left icon control.
4. Render the desktop links in a black central capsule.
5. Render `Get the app` in a separate right capsule with a slightly stronger border or tonal treatment.
6. Use negative or closely matched gaps only where needed to make the three parts read as one connected silhouette. Avoid overlapping hit areas.

Suggested layout constraints:

- Outer wrapper: `max-w-5xl`, centered, with responsive horizontal padding.
- Header height: approximately 72px to 88px, leaving breathing room around the floating control.
- Icon control: fixed square dimensions, circular shape, minimum 44px interactive target.
- Central link group: horizontal flex row with compact spacing and separators.
- CTA: minimum 44px height with enough horizontal padding for the label.
- Border radius: fully rounded capsules; avoid rounded cards around the whole page.

## Logo Treatment

The navbar must show the icon only:

```tsx
<Logo href="/" size="sm" showWordmark={false} />
```

The icon should visually read as a standalone mark rather than a mini wordmark lockup.

Before implementation, confirm the source asset can support the reference treatment:

- Prefer a transparent PNG, SVG, or other alpha-enabled asset for the icon.
- Do not depend on a JPEG background being visually removed with blend modes for the final design.
- If the existing `logo.jpg` contains a baked-in background, create or export a transparent icon asset and update the shared logo mark to use it.
- Keep the `Logo` public props unchanged so other applications are not forced to adopt the new navbar styling.
- The navbar itself may add the circular black/white treatment around the icon, but the logo asset should not contain an additional square background.

Recommended visual treatment for the icon control:

- White or near-white circular surface when the icon needs to sit outside the black capsule.
- Thin black border or soft shadow for separation from light hero backgrounds.
- Consistent `aria-label="Roomie home"` through the linked logo.
- No visible `Roomie` text in the navbar.

## Link Styling

The central links should be quiet and precise:

- White text at approximately 14px to 15px.
- Medium weight with no uppercase transformation.
- Thin vertical separators using a low-contrast white or gray border.
- Hover state: text shifts to full white and the link receives a subtle translucent highlight.
- Focus state: use a visible 2px focus ring with sufficient contrast against the black capsule.
- Active section state is optional for the first pass; do not introduce scroll-spy logic unless it already exists elsewhere.

Use semantic anchors for the existing in-page sections. Do not replace the links with buttons.

## CTA Styling

Keep the existing `openWaitlist` action and label, but make the action fit the reference silhouette:

- Use a black or near-black capsule consistent with the central navigation.
- Add a thin light border so it remains legible as a distinct action.
- Preserve the existing button semantics and accessible name.
- Maintain a minimum 44px height and clear hover, active, and focus states.
- Avoid decorative motion that changes the layout width.

If the final design needs stronger hierarchy, the CTA can use a white surface with black text while the central navigation remains black. Choose one treatment and apply it consistently across desktop and mobile.

## Responsive Plan

### Desktop

At `md` and above:

- Show the connected centered pill navigation.
- Hide the mobile menu trigger.
- Keep all three links visible.
- Keep the icon-only logo visible at the left.

### Mobile

At widths below `md`:

- Keep the icon-only logo as the left anchor.
- Replace the desktop link group and CTA with a compact menu trigger on the right.
- Preserve the existing animated dropdown, but restyle it as a dark or white surface that clearly belongs to the new pill navigation.
- Keep the same links and waitlist action in the dropdown.
- Ensure the menu does not overflow the viewport or sit beneath the fixed header.
- Close the menu after selecting an anchor or opening the waitlist flow.

The mobile trigger must remain at least 44px by 44px and retain its existing `aria-label` changes between open and closed states.

## Scroll and Background States

The reference design is intentionally self-contained, so the navbar should not expand into a full-width bar when the page scrolls.

Recommended behavior:

- At the top of the page, show the centered object with a light, restrained shadow.
- After scrolling, retain the same dimensions and centered position.
- If a background treatment is needed for contrast, use a subtle backdrop on the compact object only.
- Keep the existing hide/show animation and avoid animating width, height, or layout gaps during scroll.

The existing `scrolled` state may be simplified if it becomes unnecessary. Remove it only after confirming no visual contrast problem exists over the hero content.

## Motion and Interaction

Keep motion purposeful and small:

- Preserve the existing vertical hide/show animation.
- Preserve the mobile menu height and opacity transition.
- Keep the menu icon-to-close icon transition.
- Add a short opacity or scale entrance only if it does not delay access to navigation.
- Do not add hover animations that cause the connected capsule pieces to shift or separate.

Respect reduced-motion preferences. Framer Motion animations should either inherit the existing project convention or provide reduced-motion behavior for the header and mobile menu.

## Accessibility Requirements

- Use a semantic `<header>` and `<nav aria-label="Primary navigation">`.
- Ensure the logo link has an accessible name such as `Roomie home`.
- Preserve visible keyboard focus indicators on every link, button, and the logo.
- Keep text/background contrast at WCAG AA or better.
- Maintain 44px minimum touch targets.
- Do not rely on color alone for hover, focus, or active states.
- Ensure the mobile menu trigger communicates its state through `aria-expanded` and `aria-controls`.
- Prevent keyboard focus from reaching hidden mobile menu content when the menu is closed.
- Check that the pill remains usable at 200% browser zoom.

## Implementation Sequence

1. Confirm or create a transparent icon-only logo asset.
2. Update the shared logo mark only as needed to remove any baked-in square background.
3. Refactor the `Navbar` JSX into icon, link capsule, CTA capsule, and mobile trigger regions.
4. Replace full-width glass-bar classes with the centered capsule composition.
5. Keep the existing `navLinks`, `openWaitlist`, scroll hiding, and mobile menu behavior.
6. Add explicit accessibility attributes and focus states.
7. Test the navbar over the hero background at the top of the page and after scrolling.
8. Verify mobile layouts at narrow widths, especially around 320px.
9. Run the web app type check and lint, then manually test keyboard navigation and the waitlist action.

## Verification Checklist

- [ ] Desktop nav is centered and visually matches the connected capsule reference.
- [ ] Only the logo icon appears; the wordmark is absent from the navbar.
- [ ] The icon asset has no square or baked-in background.
- [ ] Links still scroll to the correct sections.
- [ ] `Get the app` still opens the waitlist flow.
- [ ] Scroll hide/show behavior still works.
- [ ] Mobile menu opens, closes, and closes after navigation.
- [ ] Focus rings are visible on light and dark surfaces.
- [ ] The layout does not overflow at 320px, 375px, or 768px widths.
- [ ] Reduced-motion behavior remains comfortable.
- [ ] `npm run check-types` and `npm run lint` pass for `apps/web`.

## Design Guardrails

- Keep the navigation compact and centered; do not turn it into another full-width dashboard bar.
- Do not add extra navigation categories or business logic.
- Do not introduce a second wordmark treatment in the navbar.
- Do not use a JPEG with a fake transparent background as the final icon asset.
- Keep the black-and-white reference contrast, while using the existing Roomie brand color only where it improves action clarity or focus visibility.
