# Kiln firing tracking — research summary

Sources and community practice suggest what belongs in a useful firing log. This informs our dashboard features.

## Why keep a firing log?

From [Ceramic Arts Network — Keeping a Kiln Log](https://ceramicartsnetwork.org/ceramic-recipes/recipe/keeping-a-kiln-log) and [LibreTexts — Keeping a Kiln Log](https://human.libretexts.org/Workbench/Ceramics/08%3A_Understanding_Glazes/8.06%3A_Keeping_a_Kiln_Log):

- **Consistency** — Repeat successful firings by recording schedules, settings, and outcomes
- **Troubleshooting** — Compare firings when glazes fail, pots crack, or zones fire unevenly
- **Kiln maintenance** — Track firings since element replacement; notice slowing heat-up or cold spots
- **Glaze development** — Note which clay + glaze + schedule combinations work

## Bisque vs glaze firing (basics)

From [Glazy — Firing concepts](https://help.glazy.org/concepts/firing):

| | Bisque | Glaze (main) |
|---|--------|----------------|
| Purpose | Burn out organics, sinter clay | Mature glaze, final strength |
| Typical range | Often cone 08–04 (~950–1060°C / 1740–1940°F) | Depends on clay/glaze (e.g. cone 6) |
| Porosity | Higher = more absorbent for glaze | Non-porous, glazed surface |
| Care | Slow early ramp — steam and organic burnout | Critical cooling — don't open too hot |

**Dashboard implication:** Two clear firing *types* with different default reminders and note fields.

## What experienced potters record

### Every firing

| Field | Why it matters |
|-------|----------------|
| Date & time (start / end) | Duration, scheduling, pattern over months |
| Firing type | Bisque, glaze, luster, decal, etc. |
| Firing number | Count on this kiln or since last element change |
| Target cone | What you were aiming for (e.g. cone 04 bisque, cone 6 glaze) |
| Peak temperature (meter) | Cross-check with cones; track drift over time |
| Cone results | Ground truth for heatwork — guide / target / guard cones |
| Dial or heat settings notes | For manual kilns: "dial at 6 until red, then 4" |
| Load description | What's in the kiln — count, sizes, shelf positions |
| Notes | Venting, weather, power issues, opening temperature |

### During the fire (manual kiln)

| Checkpoint | Typical concern |
|------------|-----------------|
| ~100°C / 212°F | Physical water gone — don't rush early |
| ~600–800°F | Organic burnout — reduction of speed if needed |
| Red heat onward | Faster ramp often OK depending on body |
| Near peak | Soak time, cone watching, dial adjustments |
| Shut-off decision | Based on cones + meter, not clock alone |
| Cooling | When safe to open (often below ~200°C / 392°F) |

**Dashboard implication:** Optional **timeline checkpoints** with timestamps and quick notes, not only start/end.

### Pyrometric cones (recommended detail)

From [Ceramic Info Spot — Glaze firing guide](https://ceramicinfospot.com/glaze-firing-guide-temperatures-schedules-and-troubleshooting/):

- Use a **3-cone pack**: guide (one number lower), **target**, guard (one higher)
- Proper maturity: guide fully bent, target ~90°, guard still standing
- Log cone results **per shelf or zone** if the kiln fires unevenly
- Photos of cones help later comparison

**Dashboard implication:** Cone result picker (under / perfect / over) + optional photo.

### Load & materials

| Field | Why |
|-------|-----|
| Clay body(s) | Different bodies need different schedules |
| Glaze names (glaze fire) | Link outcomes to recipes |
| Piece count / shelf map | Debug uneven firing |
| Bisque cone used | Affects glaze absorption |

### Kiln health (longer term)

| Field | Why |
|-------|-----|
| Firings since new elements | Plan maintenance |
| Thermocouple / meter drift notes | Explain low cones |
| Repairs or relay changes | Context for sudden behavior change |

## Features worth recommending (beyond a simple log)

1. **Active firing mode** — Large "log reading" button; elapsed time; last reading visible
2. **Bisque vs glaze templates** — Different default checkpoints and reminders
3. **Cone result capture** — Structured + photo
4. **Firing comparison** — Side-by-side two glaze fires when troubleshooting
5. **Maintenance counter** — Firings since element change with alert threshold
6. **Glaze / clay library** — Lightweight list linked to firings (optional MVP+)
7. **Export** — PDF or CSV for insurance, teaching, or backup
8. **Offline** — Kiln rooms often have poor Wi‑Fi (PWA offline cache)

## What manual kilns cannot auto-log (v1)

Without a digital controller or Bluetooth probe, **you** enter:

- Dial position or qualitative heat level
- Meter readings when you check
- Cone results when you unload

The app should make that **fast on iPad** — not pretend to auto-stream data we don't have.

## References

- [Keeping a Kiln Log — Ceramic Arts Network](https://ceramicartsnetwork.org/ceramic-recipes/recipe/keeping-a-kiln-log)
- [Tips and Tools: Keeping a Kiln Log](https://ceramicartsnetwork.org/ceramics-monthly/ceramics-monthly-article/Tips-and-Tools-Keeping-a-Kiln-Log-243688)
- [8.6 Keeping a Kiln Log — LibreTexts](https://human.libretexts.org/Workbench/Ceramics/08%3A_Understanding_Glazes/8.06%3A_Keeping_a_Kiln_Log)
- [Glazy — Firing concepts](https://help.glazy.org/concepts/firing)
- [Glaze firing guide — Ceramic Info Spot](https://ceramicinfospot.com/glaze-firing-guide-temperatures-schedules-and-troubleshooting/)
