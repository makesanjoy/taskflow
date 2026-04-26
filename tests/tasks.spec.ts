import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

// ─── Navigate to tasks page before each test ───────────────────────────────
test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByTestId('nav-tasks').click();
  await expect(page).toHaveURL('/tasks');
  await expect(page.getByTestId('tasks-page')).toBeVisible();
});

// ──────────────────────────────────────────────────────────────────────────
// SECTION 1: Page structure
// ──────────────────────────────────────────────────────────────────────────

test.describe('Tasks page structure', () => {

  test('shows the task list with seed tasks', async ({ page }) => {
    const grid = page.getByTestId('tasks-grid');
    await expect(grid).toBeVisible();
    // At least one task card should exist
    const cards = grid.locator('[data-testid^="task-card-"]');
    await expect(cards).not.toHaveCount(0);
  });

  test('shows filters bar', async ({ page }) => {
    await expect(page.getByTestId('filters-bar')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('status-filter')).toBeVisible();
    await expect(page.getByTestId('priority-filter')).toBeVisible();
    await expect(page.getByTestId('sort-select')).toBeVisible();
  });

  test('shows new task button', async ({ page }) => {
    await expect(page.getByTestId('new-task-button')).toBeVisible();
  });

});

// ──────────────────────────────────────────────────────────────────────────
// SECTION 2: Creating a task
// ──────────────────────────────────────────────────────────────────────────

test.describe('Create task', () => {

  test('opens modal when new task button is clicked', async ({ page }) => {
    await page.getByTestId('new-task-button').click();
    await expect(page.getByTestId('task-modal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New task' })).toBeVisible();
  });

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.getByTestId('new-task-button').click();
    await page.getByTestId('save-task-button').click();

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('title-error')).toHaveText('Title is required');
    await expect(page.getByTestId('duedate-error')).toBeVisible();
    await expect(page.getByTestId('duedate-error')).toHaveText('Due date is required');
  });

  test('creates a new task successfully', async ({ page }) => {
    await page.getByTestId('new-task-button').click();

    // Fill in the form
    await page.getByTestId('task-title-input').fill('My brand new task');
    await page.getByTestId('task-description-input').fill('This task was created by Playwright');
    await page.getByTestId('task-priority-select').selectOption('high');
    await page.getByTestId('task-status-select').selectOption('in-progress');
    await page.getByTestId('task-assignee-select').selectOption('Bob');
    await page.getByTestId('task-duedate-input').fill('2025-12-31');

    await page.getByTestId('save-task-button').click();

    // Modal should close
    await expect(page.getByTestId('task-modal')).not.toBeVisible();

    // New task card should appear in the grid
    await expect(page.getByText('My brand new task')).toBeVisible();
  });

  test('closes modal when cancel is clicked', async ({ page }) => {
    await page.getByTestId('new-task-button').click();
    await expect(page.getByTestId('task-modal')).toBeVisible();

    await page.getByTestId('cancel-button').click();
    await expect(page.getByTestId('task-modal')).not.toBeVisible();
  });

  test('closes modal when Escape key is pressed', async ({ page }) => {
    await page.getByTestId('new-task-button').click();
    await expect(page.getByTestId('task-modal')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('task-modal')).not.toBeVisible();
  });

  test('closes modal when overlay is clicked', async ({ page }) => {
    await page.getByTestId('new-task-button').click();
    await expect(page.getByTestId('task-modal')).toBeVisible();

    // Click on the overlay (not the modal itself)
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('task-modal')).not.toBeVisible();
  });

});

// ──────────────────────────────────────────────────────────────────────────
// SECTION 3: Editing a task
// ──────────────────────────────────────────────────────────────────────────

test.describe('Edit task', () => {

  test('opens edit modal with existing task data', async ({ page }) => {
    // Hover first card to reveal the action buttons
    const firstCard = page.locator('[data-testid^="task-card-"]').first();
    await firstCard.hover();

    // Get the task id from the card's data-testid
    const testId = await firstCard.getAttribute('data-testid');
    const taskId = testId!.replace('task-card-', '');

    await page.getByTestId(`edit-task-${taskId}`).click();

    // Modal should open with "Edit task" heading
    await expect(page.getByTestId('task-modal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit task' })).toBeVisible();

    // The title input should already have content (not empty)
    const titleValue = await page.getByTestId('task-title-input').inputValue();
    expect(titleValue.length).toBeGreaterThan(0);
  });

  test('updates a task title successfully', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="task-card-"]').first();
    await firstCard.hover();
    const testId = await firstCard.getAttribute('data-testid');
    const taskId = testId!.replace('task-card-', '');

    await page.getByTestId(`edit-task-${taskId}`).click();

    // Clear and retype the title
    await page.getByTestId('task-title-input').clear();
    await page.getByTestId('task-title-input').fill('Updated task title');
    await page.getByTestId('save-task-button').click();

    await expect(page.getByTestId('task-modal')).not.toBeVisible();
    await expect(page.getByText('Updated task title')).toBeVisible();
  });

});

// ──────────────────────────────────────────────────────────────────────────
// SECTION 4: Deleting a task
// ──────────────────────────────────────────────────────────────────────────

test.describe('Delete task', () => {

  test('shows confirmation prompt before deleting', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="task-card-"]').first();
    await firstCard.hover();
    const testId = await firstCard.getAttribute('data-testid');
    const taskId = testId!.replace('task-card-', '');

    await page.getByTestId(`delete-task-${taskId}`).click();

    await expect(page.getByTestId('delete-confirm')).toBeVisible();
    await expect(page.getByTestId('confirm-delete')).toBeVisible();
    await expect(page.getByTestId('cancel-delete')).toBeVisible();
  });

  test('cancels deletion when cancel is clicked', async ({ page }) => {
    const cards = page.locator('[data-testid^="task-card-"]');
    const countBefore = await cards.count();

    const firstCard = cards.first();
    await firstCard.hover();
    const testId = await firstCard.getAttribute('data-testid');
    const taskId = testId!.replace('task-card-', '');

    await page.getByTestId(`delete-task-${taskId}`).click();
    await page.getByTestId('cancel-delete').click();

    // Confirm dialog gone, card count unchanged
    await expect(page.getByTestId('delete-confirm')).not.toBeVisible();
    await expect(cards).toHaveCount(countBefore);
  });

  test('deletes a task when confirmed', async ({ page }) => {
    const cards = page.locator('[data-testid^="task-card-"]');
    const countBefore = await cards.count();

    const firstCard = cards.first();
    await firstCard.hover();

    // Grab the title so we can verify it's gone afterward
    const title = await firstCard.getByRole('heading').textContent();

    const testId = await firstCard.getAttribute('data-testid');
    const taskId = testId!.replace('task-card-', '');

    await page.getByTestId(`delete-task-${taskId}`).click();
    await page.getByTestId('confirm-delete').click();

    // One fewer card
    await expect(cards).toHaveCount(countBefore - 1);
    // That title is gone from the page
    await expect(page.getByText(title!)).not.toBeVisible();
  });

});

// ──────────────────────────────────────────────────────────────────────────
// SECTION 5: Search and filters
// ──────────────────────────────────────────────────────────────────────────

test.describe('Search and filters', () => {

  test('search filters tasks by title', async ({ page }) => {
    // Type a search term that matches one of the seed tasks
    await page.getByTestId('search-input').fill('landing page');

    const cards = page.locator('[data-testid^="task-card-"]');
    await expect(cards).toHaveCount(1);
    await expect(page.getByText('Design new landing page')).toBeVisible();
  });

  test('shows empty state when search matches nothing', async ({ page }) => {
    await page.getByTestId('search-input').fill('xyznonexistenttask123');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('tasks-grid')).not.toBeVisible();
  });

  test('clears search and shows all tasks again', async ({ page }) => {
    const allCards = page.locator('[data-testid^="task-card-"]');
    const totalCount = await allCards.count();

    await page.getByTestId('search-input').fill('landing page');
    await expect(allCards).toHaveCount(1);

    await page.getByTestId('search-input').clear();
    await expect(allCards).toHaveCount(totalCount);
  });

  test('status filter shows only matching tasks', async ({ page }) => {
    await page.getByTestId('status-filter').selectOption('done');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Every visible card should have status="done"
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-status', 'done');
    }
  });

  test('priority filter shows only matching tasks', async ({ page }) => {
    await page.getByTestId('priority-filter').selectOption('high');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-priority', 'high');
    }
  });

  test('combining status and priority filters narrows results', async ({ page }) => {
    await page.getByTestId('status-filter').selectOption('todo');
    await page.getByTestId('priority-filter').selectOption('high');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-status', 'todo');
      await expect(cards.nth(i)).toHaveAttribute('data-priority', 'high');
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────
// SECTION 6: Status cycling
// ──────────────────────────────────────────────────────────────────────────

test.describe('Status cycling', () => {

  test('cycles task status from todo → in-progress on click', async ({ page }) => {
    // Pick the first todo card, then capture its id so we can use a STABLE locator.
    // Important: `page.locator(...).first()` is dynamic — once the card cycles to
    // in-progress it will no longer match the [data-status="todo"] filter and the
    // locator will silently resolve to the *next* todo card, breaking assertions.
    const firstTodo = page.locator('[data-testid^="task-card-"][data-status="todo"]').first();
    const testId = await firstTodo.getAttribute('data-testid');
    const taskId = testId!.replace('task-card-', '');

    const card = page.getByTestId(`task-card-${taskId}`);
    const statusBtn = page.getByTestId(`status-btn-${taskId}`);

    await expect(card).toHaveAttribute('data-status', 'todo');
    await expect(statusBtn).toContainText('To Do');

    await statusBtn.click();

    await expect(statusBtn).toContainText('In Progress');
    await expect(card).toHaveAttribute('data-status', 'in-progress');
  });

});