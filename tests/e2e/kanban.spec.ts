import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@verify-corp.com')
  await page.fill('input[type="password"]', 'Admin1234!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 10_000 })
}

test.describe('Kanban', () => {
  test('Board renderiza las cuatro columnas', async ({ page }) => {
    await login(page)
    await page.goto('/trending')
    await page.waitForLoadState('networkidle')
    for (const label of ['Nuevo', 'Calificado', 'Negociación', 'Cerrado']) {
      await expect(page.getByText(label)).toBeVisible({ timeout: 5_000 })
    }
  })
})
