export type ScreenReaderNote = {
  jaws?: string
  nvda?: string
  voiceover?: string
}

export type KeyboardShortcut = {
  key: string
  action: string
}

export type ComponentStatus = 'burrito' | 'custom' | 'burrito-modified'

export type Annotation = {
  id: string
  label: string
  area: 'page-structure' | 'schedule' | 'booking-panel' | 'confirmed-panel' | 'error-handling' | 'toolbar'
  status: ComponentStatus
  statusNote?: string
  what: string
  keyboard: KeyboardShortcut[]
  screenReader: ScreenReaderNote
  aria: string[]
  gaps?: string[]
  decisions?: string[]
}

export const ANNOTATIONS: Annotation[] = [
  // ─── PAGE STRUCTURE ───────────────────────────────────────────────────────
  {
    id: 'nav-bar',
    label: 'Nav Bar (JaneNavBar)',
    area: 'page-structure',
    status: 'burrito',
    what: 'The top navigation bar. Uses the canonical JaneNavBar component from jane-nav. Contains the clinic name (h1), location dropdown, notifications, and user avatar.',
    keyboard: [
      { key: 'Tab', action: 'Moves through nav items left to right' },
      { key: 'D (JAWS)', action: 'Jump to the nav landmark directly' },
    ],
    screenReader: {
      jaws: '"Demo Clinic, heading level 1" — the clinic name is an h1 inside the nav. Pressing D in JAWS jumps to this landmark.',
      nvda: 'Same as JAWS. D cycles through landmarks, landing on the nav banner.',
      voiceover: 'Ctrl+Option+U opens Rotor. "Demo Clinic" appears under Headings. Ctrl+Option+L cycles landmarks.',
    },
    aria: [
      '<nav> wraps the entire nav bar — landmark role "banner"',
      '<h1> on the clinic name — gives the page its level-1 heading',
      'All interactive elements (dropdowns, buttons) have descriptive aria-label values',
    ],
    gaps: [
      'Notification badge count is announced as a number but has no context ("9 unread notifications" would be clearer than "9")',
    ],
    decisions: [
      'h1 is placed on the clinic name inside the nav, not on the page content. This matches what screen reader users expect — the clinic name is the identity of the application, the equivalent of a page title.',
    ],
  },
  {
    id: 'page-landmark-structure',
    label: 'Page Landmark Structure',
    area: 'page-structure',
    status: 'custom',
    statusNote: 'No Burrito equivalent — custom layout decision',
    what: 'The three-panel layout (Schedule, Chart, Appointment) is wrapped in a single <main> landmark. Each panel is a <section role="region"> labelled by its h2 heading. Chart and Appointment panels only exist in the DOM when open.',
    keyboard: [
      { key: 'Q (JAWS)', action: 'Jump to <main> — skips nav bar, lands at start of schedule' },
      { key: 'D (NVDA)', action: 'Cycle through landmarks — banner (nav), main (schedule)' },
      { key: '; (JAWS)', action: 'Next region — cycles Schedule → Date toolbar → Chart → Appointment' },
      { key: 'Ctrl+Option+U (VoiceOver)', action: 'Open Rotor — shows all landmarks and headings' },
    ],
    screenReader: {
      jaws: 'Pressing Q jumps to <main>. Pressing ; cycles through regions: "October 23, 2026, region" → "Date and break, region" → (when open) "Maya Chen, Chart, region" → "Appointment, region".',
      nvda: 'D key cycles landmarks. Insert+F7 opens Elements List showing all regions.',
      voiceover: 'Rotor (Ctrl+Option+U) shows headings and landmarks. h2 headings mark each panel. VO+Command+H jumps between headings.',
    },
    aria: [
      '<main> wraps the three-panel layout',
      'Each panel: <section role="region" aria-labelledby="[panel-h2-id]">',
      'Panels are conditionally rendered — not hidden, not aria-hidden — they are removed from the DOM when closed',
    ],
    decisions: [
      'Each panel uses aria-labelledby pointing to its h2, not aria-label. This means the heading text and the landmark label are always in sync — one source of truth.',
      'Chart and Appointment panels are not dialogs (role="dialog"). A dialog would hide the schedule from screen readers. These panels live alongside the schedule — users should still be able to navigate back.',
      'role="application" is on the appointment panel itself (not the region wrapper) so landmark navigation still works from outside.',
    ],
  },
  {
    id: 'heading-hierarchy',
    label: 'Heading Hierarchy',
    area: 'page-structure',
    status: 'custom',
    statusNote: 'Custom structure — no Burrito equivalent',
    what: 'The full heading tree a screen reader user navigates with H key. Designed so pressing H gives a logical map of the page at any state.',
    keyboard: [
      { key: 'H (JAWS/NVDA)', action: 'Jump to next heading' },
      { key: '1–6 (JAWS)', action: 'Jump to heading at that level (e.g. 2 = next h2)' },
      { key: 'VO+Command+H (VoiceOver)', action: 'Jump to next heading' },
      { key: 'Ctrl+Option+U → Headings (VoiceOver)', action: 'See all headings in a list' },
    ],
    screenReader: {
      jaws: 'H cycles: "Demo Clinic h1" → "October 23, 2026 h2" → (when open) "Maya Chen, Chart h2" → "Appointment h2" → "Booking Info h3" → "Notes h3" → etc.',
      nvda: 'Same as JAWS. H key navigates the same heading tree.',
      voiceover: 'Rotor Headings list shows all h1/h2/h3 elements. October 23, 2026 appears as h2 (fixed — was previously a div with role=heading which VoiceOver Chrome did not reliably include).',
    },
    aria: [
      '<h1> Demo Clinic — always present in nav',
      '<h2 id="date-heading"> October 23, 2026 — real h2 element (not div[role=heading])',
      '<h2 id="chart-heading"> {Patient}, Chart — sr-only, only in DOM when chart is open',
      '<h2 id="appt-panel-heading"> New Appointment / Appointment — sr-only, only in DOM when panel is open',
      '<h3> for each section header inside confirmed appointment panel (Booking Info, Notes, Billing Info, etc.)',
      '<h4> for field labels inside booking panel (Treatment, Patient, Insurance, Time)',
    ],
    gaps: [
      'Inside role="application" (booking panel), H key is disabled in JAWS/NVDA by default. User must press Insert+Z (JAWS) or Insert+Space (NVDA) to toggle browse mode before H works. In the real product, removing role="application" and using proper ARIA landmarks eliminates this friction.',
    ],
    decisions: [
      'h2 is a real <h2> element, not div[role=heading]. VoiceOver in Chrome does not reliably include ARIA role headings in the Rotor headings list.',
      'Chart heading says "{name}, Chart" not just the name — so users know they are on the chart panel, not just a person\'s name.',
    ],
  },

  // ─── SCHEDULE ─────────────────────────────────────────────────────────────
  {
    id: 'schedule-slots',
    label: 'Schedule Slot Buttons',
    area: 'schedule',
    status: 'custom',
    statusNote: 'No Burrito equivalent — custom interactive calendar cells',
    what: 'Every time slot on the schedule — booked, available, or outside shift hours — is a real <button> element. This is intentional: it means B key finds all slots, and Enter/Space activate them consistently across all screen readers.',
    keyboard: [
      { key: 'Tab', action: 'Move through slots in chronological order' },
      { key: 'Arrow Up / Down', action: 'Navigate between adjacent slots' },
      { key: 'Enter / Space', action: 'Open the appointment or booking panel' },
      { key: 'B (JAWS/NVDA)', action: 'Jump to next button — finds every slot' },
    ],
    screenReader: {
      jaws: 'Booked: "Appointment: 9:00 AM to 10:00 AM, Maya Chen, 60 Minute Massage, arrived. Press Enter to view. button." Available: "10:00 AM to 1:00 PM, available. Press Enter to book. button."',
      nvda: 'Same as JAWS — aria-label is the full announcement.',
      voiceover: '"9:00 AM to 10:00 AM, Maya Chen, 60 Minute Massage, arrived. Press Enter to view. button. You are currently on a button inside web content." (VoiceOver adds its own application mode instruction.)',
    },
    aria: [
      'aria-label carries the full readable description of each slot',
      'Visual block content is aria-hidden — the button is a transparent overlay',
      'tabIndex={0} on all slots',
      'className="schedule-slot" — focus ring applied via CSS class, not inline style (survives React re-renders)',
    ],
    gaps: [
      'Focus ring only shows on real DOM focus, not JAWS/NVDA virtual cursor movement. In browse mode (H key, arrow keys), the virtual cursor moves without triggering DOM focus events. Sighted observers during testing should use the JAWS Speech Viewer rather than watching for the focus ring.',
    ],
    decisions: [
      'Real <button> elements, not divs or links. Screen readers announce "button" and list them under B key navigation automatically.',
      'The schedule column uses role="application" — required for arrow keys to reach the DOM. Without it, JAWS exits forms mode on arrow key press and moves its virtual cursor instead.',
      'Focus ring uses CSS class not inline style — inline style changes are wiped when React state updates re-render the slot.',
    ],
  },
  {
    id: 'panel-open',
    label: 'Opening a Panel',
    area: 'schedule',
    status: 'custom',
    statusNote: 'Custom focus management — no Burrito equivalent',
    what: 'When Enter is pressed on any slot, both the Chart panel and the Appointment panel open simultaneously. Focus moves to the panel heading and a live region announces the panel opening.',
    keyboard: [
      { key: 'Enter / Space on slot', action: 'Opens panel, moves focus to panel h2 heading' },
      { key: 'Escape', action: 'Closes panel, returns focus to the slot that opened it' },
    ],
    screenReader: {
      jaws: 'Assertive live region fires: "New appointment panel opened." Focus lands on "New Appointment, heading level 2." JAWS reads heading + live region.',
      nvda: 'Same pattern — live region + heading focus.',
      voiceover: '"New Appointment Panel is open, heading level 2, New Appointment." The h2 heading is read on focus. VoiceOver also picks up the live region.',
    },
    aria: [
      'headingRef.current.focus() — moves focus to h2 on open (tabIndex={-1} on heading)',
      'Body-level role="alert" aria-live="assertive" — fires "panel opened" message',
      '50ms delay between appendChild and setting textContent — ensures screen reader has registered the element',
      'activeSlotRef stores the trigger button — focus returns here on Escape',
    ],
    decisions: [
      'Focus goes to the h2 heading, not the first form field. This gives the user context (they hear "New Appointment") before any interaction.',
      'Live region is appended to document.body, not inside the panel. Inside role="application", VoiceOver ignores live regions. Body-level regions work across all three screen readers.',
    ],
  },

  // ─── BOOKING PANEL ────────────────────────────────────────────────────────
  {
    id: 'treatment-select',
    label: 'Treatment Select',
    area: 'booking-panel',
    status: 'burrito-modified',
    statusNote: 'Burrito Select component with custom error-correction handling',
    what: 'A dropdown for selecting treatment type. Part of the validation error-correction flow — after a validation error, focus is guided here first if treatment is missing. Overlap errors (treatment too long for the time slot) are announced via a body-level live region.',
    keyboard: [
      { key: 'Tab', action: 'Focus the select' },
      { key: 'Arrow Up / Down', action: 'Change selected option' },
      { key: 'Enter / Space', action: 'Open/close the dropdown' },
    ],
    screenReader: {
      jaws: 'On focus: "Treatment, combo box, Select a Treatment." On selection: "[Treatment name] selected. Duration: 30 minutes." On overlap: "Only 30 minutes available. Please select a shorter treatment or change the time." (polite live region)',
      nvda: 'Same as JAWS.',
      voiceover: 'On focus: "Treatment, combo box." On overlap error: live region fires via body-level assertive region (inside role="application", polite live regions are ignored by VoiceOver). Announces: "Only 30 minutes available. Please select a shorter treatment or change the time."',
    },
    aria: [
      'aria-invalid="true" when field has an error',
      'aria-describedby pointing to error text element',
      'On error-correction focus: aria-describedby and aria-invalid are temporarily stripped before focusing (then restored after 8s) — prevents VoiceOver from reading "invalid, Select a Treatment" twice',
      'Overlap announcement via body-level live region (not in-panel) — VoiceOver ignores in-panel live regions inside role="application"',
    ],
    gaps: [
      'In the real product, use Burrito\'s FormField.Error for the error message — it includes the correct icon, colour, and spacing. In this prototype it is rendered manually.',
    ],
    decisions: [
      'aria-describedby and aria-invalid are stripped before error-correction focus because VoiceOver reads them in addition to the aria-label, causing "Treatment, invalid, Select a Treatment" — confusing and redundant. They are restored after 8 seconds so the invalid state is still accessible via other navigation.',
    ],
  },
  {
    id: 'patient-search',
    label: 'Patient Search (Custom Combobox)',
    area: 'booking-panel',
    status: 'custom',
    statusNote: 'Custom combobox — Burrito Combobox replaced after JAWS testing (October 2026)',
    what: 'A type-ahead search for finding patients. Replaced Burrito\'s Combobox after two issues: (1) Burrito announced "Edit combo collapsed / Zero options available" on selection — noise we cannot suppress from outside the component. (2) No navigation instruction when dropdown opened.',
    keyboard: [
      { key: 'Type', action: 'Filter patient list — results announced after 400ms debounce' },
      { key: 'Arrow Down / Up', action: 'Navigate through results' },
      { key: 'Enter', action: 'Select highlighted patient — OR — read patient details when patient already selected' },
      { key: 'Delete / Backspace', action: 'Remove selected patient' },
      { key: 'Tab', action: 'Move to next field (when patient selected)' },
    ],
    screenReader: {
      jaws: 'On type: "3 options found. Use arrow keys to select." (polite). On select: "Madison Barnaby selected. Press Enter for patient details. Press Delete to remove patient. Press Tab to Book Appointment." Focus stays on search field.',
      nvda: 'Same as JAWS.',
      voiceover: 'Same flow — live region is body-level (patientLiveRef) so VoiceOver picks it up outside role="application". Focus returns to search input after selection (not a hidden button — changed in October 2026 to match JAWS/NVDA experience).',
    },
    aria: [
      'role="combobox" aria-expanded aria-haspopup="listbox" aria-controls aria-activedescendant aria-autocomplete="list"',
      'Listbox: role="listbox" with role="option" aria-selected children',
      'Duplicate patient names: aria-label on each option includes phone and DOB to disambiguate ("Sarah Smith. Phone (604) 555-0217, born February 28, 1990.")',
      'Search results live region: body-level role="alert" (searchLiveRef) — assertive for immediate announcement',
      'Patient selection live region: body-level role="status" (patientLiveRef) — polite',
    ],
    gaps: [
      'Burrito Combobox would need: (1) prop to suppress internal "zero options" live region on selection, (2) built-in "N results found, use arrow keys" announcement, (3) per-option aria-label override for duplicate name disambiguation.',
    ],
    decisions: [
      'After patient selection, focus goes to the patient search input (not a hidden button). This matches JAWS/NVDA where the live region guides the user from the search field.',
      'Enter on the search input (when patient selected) reads patient details via a DOM-appended assertive live region — same pattern as the patient details button, but triggered by keyboard from the field the user is already on.',
    ],
  },
  {
    id: 'insurance-radios',
    label: 'Insurance Radio Buttons',
    area: 'booking-panel',
    status: 'custom',
    statusNote: 'Native radio inputs — Burrito Radio replaced after JAWS testing (October 2026)',
    what: 'Insurance selection uses native <input type="radio"> elements, not Burrito\'s Radio component. Burrito\'s Radio caused double-reading in JAWS browse mode — the input accessible name AND the label text content were both announced.',
    keyboard: [
      { key: 'Tab', action: 'Enter the radio group' },
      { key: 'Arrow Up / Down', action: 'Cycle through options' },
      { key: 'Enter / Space', action: 'Select the focused option' },
    ],
    screenReader: {
      jaws: '"Insurance Info, group. Copy Previous, October 20, 2026 — 45 Minute Massage, radio button, 1 of 3." Arrow keys cycle options. No double-read.',
      nvda: 'Same as JAWS.',
      voiceover: '"Copy Previous, October 20, 2026 — 45 Minute Massage, radio button." Arrow keys work within the fieldset group.',
    },
    aria: [
      'Native <input type="radio"> — not Burrito Radio',
      'aria-label on each input carries the full option text including sub-description',
      'No <label> element — removes the double-read source',
      'Visual option text in a sibling <div aria-hidden="true"> — sighted users see it, screen readers ignore it',
      '<Fieldset> (Burrito) wraps the group with aria-label="Insurance Info" (or "Insurance Info. Please select an insurance option." when invalid)',
    ],
    gaps: [
      'Burrito Radio would need: a prop to set aria-hidden="true" on the internal <label> element while the <input> carries its accessible name via aria-label.',
    ],
    decisions: [
      'When insurance has a validation error, the Fieldset aria-label changes to include "Please select an insurance option." — the error message travels with the group label so screen readers hear it on entry.',
      'insuranceChoice is reset to empty string when Book is pressed with an insurance error — prevents stale "none" value from skipping the insurance validation step on retry.',
    ],
  },
  {
    id: 'validation-errors',
    label: 'Validation Error Flow',
    area: 'error-handling',
    status: 'custom',
    statusNote: 'Fully custom — no Burrito equivalent for guided error-correction flow',
    what: 'When Book Appointment is pressed with missing required fields, a guided error-correction flow begins. An error summary button receives focus, announces the missing fields, and Tab guides the user to the first error field. Each field corrected advances the user to the next.',
    keyboard: [
      { key: 'Tab (from error summary)', action: 'Jump to first error field' },
      { key: 'Tab (from treatment, after fixing)', action: 'Go to patient field' },
      { key: 'Tab (from patient, after fixing)', action: 'Go to insurance' },
      { key: 'Tab (from insurance)', action: 'Go to Book Appointment button' },
    ],
    screenReader: {
      jaws: '"Please select a treatment, a patient, and an insurance option before booking. Press Tab to go to treatment." → Tab → focus on treatment select with "Treatment" label. After selecting: "30 Minute Massage selected. Press Tab to go to patient."',
      nvda: 'Same as JAWS — polite live regions inside the panel work in NVDA.',
      voiceover: 'Same flow. Error summary button focus at 50ms — assertive live region was removed because it interrupted VoiceOver reading the button. Button focus alone is sufficient for VoiceOver to read the message.',
    },
    aria: [
      'Error summary: hidden <button> tabIndex={-1}, aria-label set to the full error message + Tab instruction',
      'Focus moves to error summary button at 50ms after Book is pressed',
      'Tab key on error summary button is intercepted (e.preventDefault()) — triggers onClick which focuses the first error field',
      'Each field gets clean aria attributes before error-correction focus (aria-describedby and aria-invalid temporarily stripped on treatment)',
      'After each field is corrected, a polite live region announces the selection and the next step',
    ],
    decisions: [
      'Guided step-by-step correction (not all errors at once) — Round 1 user testing showed users lost track when all errors were announced simultaneously.',
      'Tab instruction at each step ("Press Tab to go to patient") rather than auto-advance — auto-advance felt rushed. Users need time to process before moving on.',
      'VoiceOver: assertive live region was removed from the Book button handler because it interrupted reading the error summary button. JAWS/NVDA: polite live regions inside the panel work fine.',
    ],
  },
  {
    id: 'overlap-error',
    label: 'Overlap Error (Treatment Too Long)',
    area: 'error-handling',
    status: 'custom',
    statusNote: 'Custom — Burrito has no overlap validation pattern',
    what: 'When a treatment is selected that is longer than the available time in the slot, an inline error appears and a live region announces the constraint. When Book is pressed with an overlap, assertive toasts fire AND a live region announces the full failure message.',
    keyboard: [
      { key: 'Arrow keys in Treatment select', action: 'Changing to an overlapping treatment triggers immediate announcement' },
    ],
    screenReader: {
      jaws: 'On treatment select: polite in-panel live region: "Only 30 minutes available. Please select a shorter treatment or change the time." On Book with overlap: assertive region fires "We could not book this appointment. Overlapping appointments are disabled. Only 30 minutes available..."',
      nvda: 'Same as JAWS.',
      voiceover: 'Treatment select: body-level assertive live region (overlapLiveRef) — in-panel polite regions are ignored by VoiceOver in role="application". On Book with overlap: same overlapLiveRef fires the full failure message.',
    },
    aria: [
      'On treatment-select overlap: overlapLiveRef.current.textContent set via setTimeout 50ms',
      'On Book-press overlap: overlapLiveRef fires "We could not book..." message',
      'overlapLiveRef is a body-level role="alert" created in useEffect — lives outside role="application"',
      'Visual toasts dismiss after 4 seconds to avoid showing alongside subsequent success toast',
    ],
    decisions: [
      'Body-level live region (not in-panel) — VoiceOver ignores live regions inside role="application". This was the root cause of overlap errors being silent for VoiceOver users.',
      'Error toasts reduced from 12s to 4s timeout — prevents error toasts lingering on screen when the user successfully books after correcting the overlap.',
    ],
  },

  // ─── CONFIRMED PANEL ──────────────────────────────────────────────────────
  {
    id: 'arrive-noshow',
    label: 'Arrive / No Show Buttons',
    area: 'confirmed-panel',
    status: 'burrito-modified',
    statusNote: 'Burrito Button with custom state-change announcement',
    what: 'Two action buttons at the top of the confirmed appointment panel. Pressing Arrive turns the button green and announces the state change. No Show turns the button red.',
    keyboard: [
      { key: 'Tab', action: 'Focus Arrive button' },
      { key: 'Tab', action: 'Focus No Show button' },
      { key: 'Enter / Space', action: 'Activate — state change announced immediately' },
    ],
    screenReader: {
      jaws: '"Appointment marked as arrived." (assertive). Button style changes are visual only — announcement is the only signal.',
      nvda: 'Same as JAWS.',
      voiceover: 'Body-level assertive live region (statusLiveRef) fires: "Appointment marked as arrived." or "Appointment marked as no show." — in-panel live regions are ignored by VoiceOver inside role="application".',
    },
    aria: [
      'statusLiveRef: body-level role="alert" created in useEffect — outside role="application"',
      'Button visual state (green/red background) is a CSS style change — not announced by screen readers',
      'Announcement is the only accessible signal of state change — visual users see the colour, screen reader users hear the message',
    ],
    decisions: [
      'Body-level live region required for VoiceOver — same pattern as overlap errors. Inside role="application", VoiceOver ignores in-panel live regions.',
    ],
  },
  {
    id: 'section-headers',
    label: 'Collapsible Section Headers (h3 buttons)',
    area: 'confirmed-panel',
    status: 'custom',
    statusNote: 'Custom pattern — each section header is a <button> inside an <h3>',
    what: 'Each section in the confirmed appointment panel (Booking Info, Notes, Billing Info, etc.) is a collapsible section. The header is a <button> inside an <h3> — meaning H key navigation finds it AND Enter expands/collapses it.',
    keyboard: [
      { key: 'H (JAWS/NVDA browse mode)', action: 'Jump to next section header' },
      { key: 'Enter / Space', action: 'Expand or collapse the section' },
    ],
    screenReader: {
      jaws: '"Booking Info, collapsed, button, heading level 3." Pressing Enter: "Booking Info, expanded, button, heading level 3."',
      nvda: 'Same as JAWS.',
      voiceover: 'Rotor headings list shows all h3 section headers. VO+Command+H cycles through them.',
    },
    aria: [
      '<h3> wraps each section header <button>',
      'aria-expanded="true/false" on the button — announces expanded/collapsed state',
      'aria-controls pointing to the collapsible content div',
    ],
    decisions: [
      'Button inside h3 (not h3 with role="button") — this is the correct ARIA pattern. It gives screen reader users both heading navigation AND button activation from the same element.',
    ],
  },

  // ─── TOOLBAR ──────────────────────────────────────────────────────────────
  {
    id: 'date-toolbar',
    label: 'Date Navigation Toolbar',
    area: 'toolbar',
    status: 'burrito-modified',
    statusNote: 'Burrito IconButton and Button components, custom toolbar wrapper',
    what: 'The toolbar at the bottom of the schedule — previous day, today, next day, create break, go to date. Uses role="toolbar" and is wrapped in a region for landmark navigation.',
    keyboard: [
      { key: '; (JAWS)', action: 'Jump to "Date and break" region directly' },
      { key: 'Tab', action: 'Move through toolbar buttons' },
      { key: 'Enter / Space', action: 'Activate button' },
    ],
    screenReader: {
      jaws: 'Pressing ; (semicolon) lands on "Date and break, region." Tab into toolbar: "Date and break, toolbar." First button: "Previous day, October 22, 2026, button."',
      nvda: 'D key finds the landmark. B key finds each toolbar button.',
      voiceover: 'Landmark navigation (Ctrl+Option+U) includes "Date and break." VO+Command+H or Tab moves through buttons.',
    },
    aria: [
      '<section role="region" aria-label="Date and break"> wraps the toolbar',
      '<div role="toolbar" aria-label="Date and break"> inside the region',
      'Each button has aria-label including the target date: "Next day, October 24, 2026"',
      'After date navigation, focus moves to the date h2 heading so the new date is announced',
    ],
    decisions: [
      'role="toolbar" not <nav> — an earlier version used two <nav> landmarks ("Date navigation" and "Break and go to date"). JAWS announced landmark labels while browsing, which felt noisy. Toolbar groups the controls cleanly.',
      'Region wrapper enables ; (semicolon) landmark navigation to the toolbar — without it, users would need to press B repeatedly through every slot to reach toolbar buttons.',
      'All buttons include the target date in aria-label — users know where they will land before pressing.',
    ],
  },
]

export const AREAS: { id: Annotation['area']; label: string; description: string }[] = [
  { id: 'page-structure', label: 'Page Structure', description: 'Landmarks, headings, and the three-panel layout skeleton' },
  { id: 'schedule', label: 'Schedule', description: 'Slot buttons, panel opening, focus management' },
  { id: 'booking-panel', label: 'Booking Panel', description: 'Treatment, patient search, insurance — the new appointment form' },
  { id: 'error-handling', label: 'Error Handling', description: 'Validation errors, guided correction flow, overlap errors' },
  { id: 'confirmed-panel', label: 'Confirmed Appointment Panel', description: 'Arrive/No Show, collapsible sections, patient details' },
  { id: 'toolbar', label: 'Date Toolbar', description: 'Date navigation and break creation controls' },
]
