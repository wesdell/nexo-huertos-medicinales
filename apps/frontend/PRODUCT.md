# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mixed garden communities in Ecuador: volunteers from urban neighborhoods and rural communities, of varied ages, many with little digital experience. They use the app on a phone outdoors, in the garden, often in bright sun and with busy or dirty hands. A community can be a single person or a whole neighborhood.

## Product Purpose

Motivate people to start and keep medicinal gardens by bridging ancestral knowledge (lunar calendar, rituals, hot/cold plant qualities, natural fences, orientation to the East) with digital tools. Users register their real garden, plants and activities (land preparation, sowing, watering, harvest), and see a virtual "mirror garden" that reflects the real one. Success: communities keep registering activities and their virtual garden advances.

## Positioning

Not a generic gardening tracker: every recommendation comes from Andean ancestral practice (moon phase per activity, harvest after the dew, rituals), and the app warns gently instead of blocking ("save anyway"). The virtual garden is a mirror of the real, community-owned garden.

## Operating Context

- Main loop: open app in the garden → see the day's moon-phase recommendation → register an activity → see points and the virtual garden advance.
- Roles: volunteer, community member, community responsible (creates community, garden, plants), moderator (v3).
- Language: Spanish (Ecuador). Dates shown dd/mm/aaaa.
- Evaluated as a university project for the course Calidad de Software: usability, accessibility, responsive behavior and test evidence are graded.
- Releases: v1.0.0 MVP (2026-11-10), then v2.0.0 and v3.0.0 (see docs/bitacora.md).

## Capabilities and Constraints

- v1: registration with personal-data consent (LOPDP Ecuador), login, create community, register garden (province, parish, coordinates), plants, 4 activity types with errors vs. confirmable warnings, points, virtual garden stages 0–4, daily moon recommendation, ancestral tips.
- Stack fixed: React + Vite + Tailwind v4 SPA, NestJS API, PostgreSQL, Docker Compose.
- Later versions add map, forum, badges, missions, ranking, photos.

## Brand Commitments

- Name: **Nexo**. Binding.
- Logo and favicon: none exist yet; to be designed.
- docs/arquitectura-y-diseno/diseno.md (green/earth palette, Fraunces + Inter) is a reference only, not binding.

## Evidence on Hand

- User stories HU-001..035 in docs/historias-de-usuario.
- No real testimonials, partner organizations, photos or metrics exist; do not fabricate them.

## Product Principles

1. Built for the garden: one-handed, outdoor-readable, large targets.
2. Warn, never scold: ancestral recommendations are advice with "save anyway".
3. The screen mirrors the soil: every registered action shows visible progress.
4. Recognize knowledge: points and stages celebrate care, soberly.
5. Every state counts: empty, error and loading states are designed.

## Accessibility & Inclusion

WCAG 2.1 AA minimum (graded). Low digital literacy: plain Spanish, text labels with icons, color never the only signal, reduced-motion respected, high contrast for sunlight.
