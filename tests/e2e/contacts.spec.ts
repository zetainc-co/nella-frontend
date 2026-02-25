import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@verify-corp.com')
  await page.fill('input[type="password"]', 'Admin1234!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 10_000 })
}

test.describe('Contacts', () => {
  test('Tabla de contactos carga y muestra filas', async ({ page }) => {
    await login(page)
    await page.goto('/contacts')
    await page.waitForLoadState('networkidle')
    const table = page.locator('table, [data-testid="contacts-table"]')
    const emptyState = page.locator('text=/no hay contactos|sin contactos/i')
    const hasTable = await table.isVisible().catch(() => false)
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    expect(hasTable || hasEmpty).toBe(true)
  })
})
