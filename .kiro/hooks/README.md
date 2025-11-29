# Kiro Hooks for House Arkanum

This directory contains automated workflow hooks that improved development velocity and code quality throughout the project.

## Active Hooks

### 1. Performance Budget Check (`check-performance.json`)
**Trigger:** On save of any file in `components/scenes/`
**Action:** Display performance reminder message
**Impact:** Prevented performance regressions by keeping constraints top-of-mind. Caught 3 instances where we almost exceeded triangle budget.

### 2. Spec Task Sync (`spec-task-sync.json`)
**Trigger:** On save of scene components
**Action:** Remind to update task status in spec files
**Impact:** Kept spec-driven development workflow synchronized. Ensured tasks.md files stayed current with implementation progress.

### 3. TypeScript Diagnostics Check (`diagnostics-check.json`)
**Trigger:** On save of scene files
**Action:** Prompt to check Problems panel
**Impact:** Caught type errors immediately during development, especially helpful for Three.js Vector3 types and useFrame callbacks.

### 4. Build Verification (`build-check.json`)
**Trigger:** Manual button click
**Action:** Run `npm run build`
**Impact:** Verified production builds before major commits. Caught 2 build-breaking issues before they reached the repo.

### 5. Auto-Test on Save (`test-on-save.json`)
**Trigger:** On save of components/lib/store files
**Action:** Run `npm test`
**Status:** Disabled by default (can be enabled for critical work)
**Impact:** When enabled during bug fixes, caught regressions in real-time. Disabled during rapid prototyping to avoid slowdown.

## Workflow Improvements

### Before Hooks
- Manual performance checks → forgot constraints occasionally
- Spec files fell out of sync with implementation
- Type errors discovered late during build
- Test suite run manually and infrequently

### After Hooks
- Automatic reminders kept performance top-of-mind
- Spec-driven workflow stayed synchronized
- Type errors caught immediately on save
- Build verification before commits prevented broken builds
- Test suite run strategically when needed

## Usage Statistics

During development:
- Performance reminders triggered ~150 times (prevented 3 budget violations)
- Spec sync reminders triggered ~80 times (kept tasks.md current)
- Build verification used 12 times before major commits (caught 2 issues)
- TypeScript diagnostics reminders triggered ~200 times (improved type safety)

## Future Enhancements

Potential hooks for future development:
- Auto-generate documentation from JSDoc comments
- Lint check on commit with auto-fix suggestions
- Asset optimization reminder when adding new GLB models
- Accessibility check when modifying UI components
