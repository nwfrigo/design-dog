# Content Block Decoupling & Placeholder Standardization

> Catalogue of every editable text/cta/group block across the single-asset templates. Use this doc to:
> 1. Set canonical placeholders per block kind (top section)
> 2. Override per template where the design calls for it (per-template sections)
> 3. Track which blocks still couple visibility to content presence (`decoupled` column)
>
> Once the placeholders are decided, an engineer can sweep the codebase in one pass:
> - drop every `&& !!X` / `&& hasX` from visibility gates
> - render the standard placeholder when the underlying value is empty
> - emit the placeholder inside the `defaultInner` (ContentStack) or inside the `wrapInline(...)` body (Track 2)

---

## Principle

**Block existence ≠ content presence.**

A bench-toggleable slot must render whenever its `show*` flag is true, regardless of whether the user has typed content yet. When the underlying value is empty, render a placeholder. This is what makes WYSIWYG work: users toggle the block on, see a placeholder rendered in the correct style, double-click to start typing.

Today most blocks gate on `showX && !!X` (or `showX && hasX`). That breaks the toggle-on flow: the block doesn't render until the user types something — but they can't type until they double-click the block, which doesn't exist yet.

---

## Standard placeholders (canonical)

Fill these in. Per-template sections below default to the canonical placeholder unless overridden in their "Proposed Placeholder" column.

| Block kind | Canonical placeholder | Notes |
|---|---|---|
| `eyebrow` |   | uppercase per design? |
| `headline` |   |   |
| `subhead` / `subheading` |   |   |
| `body` | `Body copy goes here.` | already used in recent fixes |
| `metadata` |   |   |
| `cta` |   |   |
| `eventDate` |   |   |
| `eventLocation` |   |   |
| `eventTime` |   |   |
| `workshopName` |   |   |
| `speakerName` |   | applies to speaker1/2/3 Name |
| `speakerRole` |   | applies to speaker1/2/3 Role |
| `gridDetail` |   | applies to gridDetail1..4; may need per-row text |

---

## Legend (per-template tables)

- **Decoupled?** — `✅` = visibility gates only on `show*` flag. `❌` = visibility gates on content presence too (`&& !!X` / `&& hasX`).
- **Current Visibility** — exact expression from the template source.
- **Current Placeholder** — string rendered when the underlying value is empty. Blank if the block renders nothing for empty values.
- **Proposed Placeholder** — fill in. Leave blank to mean "use the canonical default."
- **Notes** — anything unusual.

---

## Email templates

### EmailDarkGradient

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && hasSubhead` | ❌ |   |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| cta | `showCta && hasCta` | ❌ |   |   |   |

### EmailGrid

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showLightHeader && showHeadline` | ❌ | `Headline` |   |   |
| subheading | `showSubheading && !!subheading` | ❌ |   |   |   |
| body | `showBody` | ✅ | `This is your body copy. Lorem ipsum dolor sit am` |   | placeholder is mid-sentence — refine |
| gridDetail1 | always rendered | ✅ |   |   | grid row |
| gridDetail2 | `showGridDetail2` | ✅ |   |   | grid row |
| gridDetail3 | always rendered (3-row vs 2-row mode) | ✅ |   |   | grid row |

### EmailImage

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |

### EmailSpeakers

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |
| speaker1 (group) | derived from showSpeaker1 / speakerCount | ❌ |   |   | nested group; contains name + role + image |
| speaker1Name | `showSpeaker1` | ✅ | `Firstname Lastname` |   | nested |
| speaker1Role | `showSpeaker1` | ✅ | `Role, Company` |   | nested |
| speaker2 (group) | derived from showSpeaker2 / speakerCount | ❌ |   |   | nested group |
| speaker2Name | `showSpeaker2` | ✅ | `Firstname Lastname` |   | nested |
| speaker2Role | `showSpeaker2` | ✅ | `Role, Company` |   | nested |
| speaker3 (group) | derived from showSpeaker3 / speakerCount | ❌ |   |   | nested group |
| speaker3Name | `showSpeaker3` | ✅ | `Firstname Lastname` |   | nested |
| speaker3Role | `showSpeaker3` | ✅ | `Role, Company` |   | nested |

### EmailProductRelease

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | always | ✅ | `Product Release` |   | Track 2 |
| headline | always | ✅ | `GX2 2026.1` |   | Track 2 |

### EmailCorityConnect2026

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | `showHeadline` | ✅ | `Lightweight header.` |   | Track 2 |
| body | `showBody` | ✅ | `Body copy goes here.` |   | Track 2; fixed in recent commit |
| cta | `showCta && ctaText` | ❌ |   |   | Track 2 |

### EmailCorityCustomerExchangeBanner

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | `showHeadline` | ✅ | `Headline` |   | Track 2 |
| body | `showBody` | ✅ | `Body copy goes here.` |   | Track 2; fixed in recent commit |
| cta | `showCta && ctaText` | ❌ |   |   | Track 2 |

### EmailCorityCustomerExchangeSignature

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eventDate | `showEventDate` | ✅ | `Thursday, May 7th` |   | Track 2 |
| eventLocation | `showEventLocation` | ✅ | `Brussels, Belgium` |   | Track 2 |
| eventTime | `showEventTime` | ✅ | `10:00–16:00` |   | Track 2 |
| cta | `showCta` | ✅ | `Join Us` |   | Track 2 |

### EmailEhsAccelerateBanner

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | always | ✅ | `In-Person. Exclusive.` |   | Track 2 |
| body | `showBody` | ✅ | `Join senior EHS+ leaders to modernize how you stay ahead of operating risks.` |   | Track 2 |
| eventDate | always | ✅ | `Thursday, 13th November` |   | Track 2 |
| eventLocation | always | ✅ | `London, UK` |   | Track 2 |
| cta | always | ✅ | `Join Us` |   | Track 2 |

### EmailEhsAccelerateInvitation (deferred from S&B migration)

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| invitationHeader | always | ✅ | `You're Invited` |   | not yet migrated to S&B |
| invitationHeadline | always | ✅ | `Exclusive EHS+ Leader Workshop` |   | not yet migrated |
| invitationEventTitle | always | ✅ | `EHS+ Accelerate: Tech Convergence Workshop` |   | not yet migrated |
| invitationEventDate | always | ✅ | `13 November` |   | not yet migrated |
| invitationEventLocation | always | ✅ | `London, England` |   | not yet migrated |
| invitationEventTime | always | ✅ | `10:00–14:30` |   | not yet migrated |
| invitationEventTimeNote | always | ✅ | `Lunch Included` |   | not yet migrated |
| invitationBody | always | ✅ | (long DEFAULT_BODY constant) |   | rich HTML |

### EmailEhsAccelerateSignature

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eventDate | `showEventDetails` | ✅ | `Thursday,  13th November` |   | Track 2 |
| eventLocation | `showEventDetails` | ✅ | `London, UK` |   | Track 2 |
| workshopName | `showWorkshopName` | ✅ | `Exclusive EHS+ Leader Workshop` |   | Track 2 |
| cta | `showCta` | ✅ | `Join Us` |   | Track 2 |

---

## Newsletter templates

### NewsletterBlueGradient

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| cta | `showCta && ctaText` | ❌ |   |   | rendered outside ContentStack |

### NewsletterDarkGradient

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| cta | `showCta && ctaText` | ❌ |   |   | rendered outside ContentStack |

### NewsletterLight

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| cta | `showCta && ctaText` | ❌ |   |   | rendered outside ContentStack |

### NewsletterTopBanner (deferred from S&B migration)

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | always | ✅ | `Month \| Year` |   | not yet migrated |
| headline | `showHeadline` | ✅ |   |   | no fallback in code; bare value |
| subhead | `showSubhead && subhead` | ❌ |   |   | not yet migrated |

---

## Social templates

### SocialBlueGradient

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && hasSubhead` | ❌ |   |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| metadata | `showMetadata && !!metadata` | ❌ |   |   |   |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |

### SocialDarkGradient

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && hasSubhead` | ❌ |   |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| metadata | `showMetadata && !!metadata` | ❌ |   |   |   |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |

### SocialImage

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && hasSubhead` | ❌ |   |   |   |
| metadata | `showMetadata && !!metadata` | ❌ |   |   |   |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |

### SocialImageMeddbase

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && hasSubhead` | ❌ |   |   |   |
| metadata | `showMetadata && !!metadata` | ❌ |   |   |   |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |

### SocialGridDetail

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| gridDetail1 | always | ✅ |   |   | grid row |
| gridDetail2 | always | ✅ |   |   | grid row |
| gridDetail3 | `showRow3` | ✅ |   |   | grid row |
| gridDetail4 | `showRow4` | ✅ |   |   | grid row |

### SocialEhsAccelerate

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && hasSubhead` | ❌ |   |   |   |
| cta | `showCta && !!ctaText` | ❌ |   |   |   |

---

## Website templates

### WebsiteThumbnail

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Lightweight header.` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| cta | `showCta && !!cta` | ❌ |   |   |   |

### WebsitePressRelease

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Lightweight header.` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| cta | `showCta && !!cta` | ❌ |   |   |   |

### WebsiteWebinar

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Lightweight header.` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| body | `showBody` | ✅ | `Body copy goes here.` |   | fixed in recent commit |
| cta | `showCta && !!cta` | ❌ |   |   |   |

### WebsiteEventListing

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| gridDetail1 | always | ✅ |   |   | grid row |
| gridDetail2 | `showRow3` | ✅ |   |   | grid row |
| gridDetail3 | `showRow4` | ✅ |   |   | grid row |
| gridDetail4 | always | ✅ |   |   | grid row (CTA row) |

### WebsiteEhsAccelerateListing

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Headline` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| gridDetail1 | always | ✅ |   |   | grid row |
| gridDetail2 | `showRow3` | ✅ |   |   | grid row |
| gridDetail3 | `showRow4` | ✅ |   |   | grid row |
| gridDetail4 | always | ✅ |   |   | grid row (CTA row) |

### WebsiteReport

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && !!eyebrow` | ❌ |   |   |   |
| headline | `showHeadline` | ✅ | `Lightweight header.` |   |   |
| subhead | `showSubhead && !!subhead` | ❌ |   |   |   |
| cta | `showCta && !!cta` | ❌ |   |   |   |

### WebsiteFloatingBanner

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && eyebrow` | ❌ |   |   | Track 2 |
| headline | `showHeadline` | ✅ | `Headline` |   | Track 2 |
| cta | always | ✅ | `Learn More` |   | Track 2 |

### WebsiteFloatingBannerMobile

| Block | Current Visibility | Decoupled? | Current Placeholder | Proposed Placeholder | Notes |
|---|---|---|---|---|---|
| eyebrow | `showEyebrow && eyebrow` | ❌ |   |   | Track 2 |
| headline | `showHeadline` | ✅ | `Headline` |   | Track 2 |
| cta | `arrowType === 'text'` | ❌ | `Learn More` |   | Track 2; conditional on arrowType |

---

## Roll-up — what needs work

**Already decoupled** (no engineering needed — just set/confirm placeholder):
- Most `body` blocks (fixed in recent sweep)
- Most `headline` blocks (already had placeholders)
- Most Track 2 blocks (`EmailEhsAccelerate*`, `Email*Signature`, `EmailProductRelease`, etc.)

**Still coupled** — gates on `&& !!X` / `&& hasX` and needs the sweep:
- `eyebrow` on ~12 templates
- `subhead` / `subheading` on ~10 templates
- `cta` on ~10 templates
- `metadata` on 4 social templates
- `speaker1/2/3` group visibility on `EmailSpeakers` (the umbrella; the per-field names/roles are already decoupled)

Once placeholders are set above, the sweep is mechanical: drop the `&& !!X` clauses and add a `|| 'placeholder'` fallback in the `defaultInner` or `wrapInline` body.
