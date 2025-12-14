# Feature: Task Status Filter

## Feature Description
Add the ability to filter tasks on the Kanban board by their status (Backlog, Todo, In Progress, Test, Done). Users will be able to show or hide specific columns dynamically, allowing them to focus on relevant task statuses. This feature enhances the user experience by reducing visual clutter and enabling users to customize their board view based on their workflow needs.

## User Story
As a task manager
I want to filter tasks by their status and show/hide specific columns
So that I can focus on relevant tasks and reduce visual clutter on my board

## Problem Statement
Currently, the Kanban board displays all five columns (Backlog, Todo, In Progress, Test, Done) at all times. This creates several challenges:
- Visual clutter when many tasks exist across all columns
- Difficulty focusing on specific stages of work
- Limited screen space utilization, especially on smaller devices
- No ability to customize the view based on workflow needs
- Users working on specific phases (e.g., testing) cannot isolate relevant columns

The board lacks flexibility to adapt to different work contexts and user preferences.

## Solution Statement
Implement a column visibility toggle system that allows users to:
1. View toggle controls for each status column (Backlog, Todo, In Progress, Test, Done)
2. Show/hide columns individually with immediate visual feedback
3. Persist column visibility preferences in browser localStorage
4. Display only filtered columns in the columns container
5. Show a visual indicator when columns are hidden (e.g., count of hidden columns)

The solution will use React state management combined with localStorage for persistence. The UI will feature toggle buttons (checkboxes or pills) positioned in the board-actions area, allowing quick access. The filtering logic will be integrated into the existing Board component, ensuring seamless compatibility with current features like search and drag-and-drop.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/components/Board.tsx` - Main board component where filtering UI and logic will be added
  - Contains COLUMNS array defining all available columns
  - Manages task display and search functionality
  - Ideal location for column visibility state and filter controls

- `app/client/src/components/Board.css` - Styling for the board component
  - Contains styles for board-actions and columns-container
  - Will need new styles for filter toggles and visual states
  - Handles responsive design for mobile devices

- `app/client/src/components/Column.tsx` - Individual column component
  - Displays single status column with tasks
  - No changes needed but will benefit from visibility filtering in parent

- `app/client/src/types/Task.ts` - Type definitions for tasks and columns
  - Contains TaskStatus type and Column interface
  - May need extension if adding filter-specific types

### New Files
- `app/client/src/components/__tests__/Board.filter.test.tsx` - Unit tests for the filter functionality
  - Test column visibility toggling
  - Test localStorage persistence
  - Test integration with existing search functionality

## Implementation Plan

### Phase 1: Foundation
1. Define the column visibility state structure in Board component
2. Add utility functions for localStorage operations (get/set visible columns)
3. Create TypeScript interface for column visibility state
4. Initialize default state (all columns visible) on component mount
5. Implement localStorage sync to persist user preferences across sessions

### Phase 2: Core Implementation
1. Build the Column Filter UI component
   - Create toggle controls (checkboxes or toggle switches) for each column
   - Position controls in the board-actions section
   - Add labels and icons for better UX
   - Implement click handlers to update visibility state

2. Integrate filtering logic with existing COLUMNS rendering
   - Filter COLUMNS array based on visibility state before rendering
   - Ensure drag-and-drop still works with filtered columns
   - Update columns-container grid to handle variable column count

3. Add visual feedback
   - Show active/inactive states for toggle controls
   - Display count of hidden columns if any are hidden
   - Add smooth transitions for column show/hide

4. Implement localStorage persistence
   - Save visibility state on every toggle change
   - Load visibility state on component mount
   - Handle edge cases (corrupted localStorage, missing data)

### Phase 3: Integration
1. Ensure compatibility with existing search functionality
   - Verify search works across both visible and hidden columns
   - Consider showing a message if search results exist in hidden columns

2. Test drag-and-drop behavior
   - Verify tasks can be dragged between visible columns
   - Ensure dropping on visible columns works correctly
   - Test edge cases with single visible column

3. Mobile responsive design
   - Ensure filter controls work on mobile devices
   - Stack filter toggles appropriately on small screens
   - Maintain usability with touch interactions

4. Accessibility enhancements
   - Add ARIA labels to toggle controls
   - Ensure keyboard navigation works
   - Add screen reader announcements for visibility changes

## Step by Step Tasks

### 1. Setup Foundation and Types
- Add column visibility state to Board component (`visibleColumns: Set<TaskStatus>`)
- Create utility functions `getVisibleColumnsFromStorage()` and `saveVisibleColumnsToStorage()`
- Initialize state with localStorage data or default to all columns visible
- Add TypeScript types for localStorage structure if needed

### 2. Implement Column Filter UI
- Create filter controls section in the board-actions div
- Add toggle button/checkbox for each column in COLUMNS array
- Style the filter controls using Board.css (follow existing design patterns)
- Ensure controls are positioned before or after the search input appropriately
- Add icons or color indicators matching each column's color

### 3. Wire Up Filtering Logic
- Implement `handleToggleColumn` function to update `visibleColumns` state
- Filter the COLUMNS array based on `visibleColumns` before mapping in the render
- Update localStorage whenever visibility state changes
- Add visual indicator showing count of hidden columns (e.g., "5 columns | 2 hidden")

### 4. Add Styling and Visual Feedback
- Style the filter toggle controls (checkboxes/pills/switches)
- Add active/inactive states with appropriate colors
- Use column colors as accents in the toggle controls
- Add smooth CSS transitions for show/hide animations
- Ensure responsive design on mobile (stack controls vertically if needed)

### 5. Test Integration with Existing Features
- Verify drag-and-drop works correctly with filtered columns
- Test search functionality continues to work across visible columns
- Check that task counts in column headers remain accurate
- Ensure adding tasks still works when target column might be hidden

### 6. Create Unit Tests
- Create test file `app/client/src/components/__tests__/Board.filter.test.tsx`
- Test toggling individual columns on/off
- Test localStorage persistence (save and load)
- Test edge case: all columns hidden (should show warning or prevent)
- Test integration with search functionality
- Test initial state loading from localStorage

### 7. Add Accessibility Features
- Add `aria-label` attributes to all toggle controls
- Add `aria-pressed` or `aria-checked` states
- Implement keyboard navigation (Space/Enter to toggle)
- Add screen reader announcement when columns are hidden/shown
- Ensure focus management works correctly

### 8. Handle Edge Cases
- Prevent hiding all columns (require at least one visible)
- Handle localStorage quota exceeded error gracefully
- Add fallback for browsers without localStorage support
- Show helpful message if no columns are visible
- Consider "Reset filters" button to restore all columns

### 9. Final Integration and Polish
- Test the complete feature end-to-end in running application
- Verify mobile responsiveness thoroughly
- Check cross-browser compatibility (Chrome, Firefox, Safari)
- Ensure performance is not degraded with filtering
- Review code for consistency with existing patterns

### 10. Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Fix any failing tests or issues discovered
- Verify the feature works as expected in development environment

## Testing Strategy

### Unit Tests
- Test `getVisibleColumnsFromStorage()` returns correct default when localStorage is empty
- Test `saveVisibleColumnsToStorage()` correctly serializes and saves to localStorage
- Test `handleToggleColumn()` updates state correctly when toggling columns on/off
- Test filtering logic correctly filters COLUMNS array based on visibility state
- Test edge case: attempt to hide all columns (should prevent or show warning)
- Test localStorage persistence across component remounts

### Integration Tests
- Test filter toggles interact correctly with search functionality
- Test drag-and-drop works when some columns are hidden
- Test adding new tasks when target column is hidden (should still work)
- Test column visibility persists after page refresh
- Test mobile responsive behavior (toggles stack correctly)
- Test keyboard navigation through filter controls

### Edge Cases
- localStorage is disabled or unavailable in browser
- localStorage contains corrupted data for column visibility
- User tries to hide all columns at once
- Search has results in hidden columns (should indicate this)
- Only one column visible and user performs drag-and-drop
- Very small screen sizes with many filter toggle controls
- Browser localStorage quota exceeded

## Acceptance Criteria
1. Users can see toggle controls for each column (Backlog, Todo, In Progress, Test, Done) in the board interface
2. Clicking a toggle control immediately shows or hides the corresponding column
3. Column visibility preferences persist across page refreshes using localStorage
4. At least one column must remain visible at all times (prevent hiding all columns)
5. Visual indicator shows which columns are currently visible/hidden
6. Filter toggles are styled consistently with the existing application design
7. Drag-and-drop functionality continues to work with filtered columns
8. Search functionality works correctly regardless of which columns are visible
9. Filter controls are responsive and work on mobile devices
10. Accessibility features (ARIA labels, keyboard navigation) are fully implemented
11. All existing tests continue to pass (zero regressions)
12. New unit tests for filter functionality achieve at least 80% code coverage

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/client && npm run build` - Build the client to ensure no TypeScript errors
- `cd app/client && npm run lint` - Run linting to ensure code quality (if lint script exists)
- `cd app/server && npm test` - Run server tests to validate no backend regressions
- `cd app && ./start.sh` - Start the application and manually test the filter functionality
  - Verify toggle controls appear in the board-actions section
  - Test toggling each column on and off
  - Refresh the page and verify column visibility persists
  - Test with search functionality active
  - Test drag-and-drop with some columns hidden
  - Test on mobile/responsive view
  - Test keyboard navigation and accessibility
- `cd app && ./stop.sh` - Stop the application after manual testing

## Notes
- **localStorage key**: Use a descriptive key like `taskTracker.visibleColumns` to avoid conflicts
- **Default behavior**: All columns should be visible by default on first load
- **Performance**: Filtering is a client-side operation with negligible performance impact
- **Future enhancements**: Consider adding preset filters (e.g., "Active Tasks" = Todo + In Progress + Test)
- **Design consideration**: Toggle controls could be implemented as checkboxes, toggle switches, or pill buttons - choose based on existing design system
- **Accessibility**: Ensure color is not the only indicator of visibility state (use text labels or icons)
- **Mobile optimization**: Consider a dropdown or modal for filter controls on very small screens
- **Backend**: No backend changes required as this is purely a frontend filtering feature
- **Drag-and-drop edge case**: Consider what happens when a user tries to drag a task to a hidden column (should show column temporarily or prevent the action)
