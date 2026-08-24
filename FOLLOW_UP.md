BUILD_SPEC.md updated again. Re-read it and apply these changes.

**1. New catalog: Mechanisms.** 12 entries, listed in the spec's Catalog section. Each has a name, the HLD problem it ties to, and what to measure. Add a fifth tab to the catalog view.

**2. The B-day `build` task alternates.** Odd-numbered B days serve the agentic build. Even-numbered B days serve the next unchecked Mechanism from the catalog, labelled with the tie-in problem and the measurement in the subtitle. Ticking it marks the catalog entry, same as `design` and `gfe`.

**3. Mechanism builds record a result.** Add `mechResults: Record<number, string>` to `TrackerState`. When a mechanism task is expanded, show a short single-line input labelled "The number" above the notes textarea, saving to `mechResults[index]`. In the catalog view, mechanisms that have a recorded result display it in mono to the right of the name.

**4. Add a Mechanisms progress bar**, target 9. Nine even-numbered B days fall inside 42 days.

**5. Metrics view:** add the recorded mechanism results as a compact list in the Recent notes panel, since these are the numbers worth rereading before an interview.

Commit these as separate logical changes and push each one.