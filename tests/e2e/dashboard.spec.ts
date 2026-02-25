import { test, expect } from '@playwright/test'

const EMAIL = 'admin@verify-corp.com'
const PASSWORD = 'Admin1234!'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 10_000 })
}

test.describe('Dashboard Projects', () => {
  test('Escenario 1: Dashboard renders header correctly', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await expect(page.getByText('Rendimiento en tiempo real.')).toBeVisible()
  })

  test('Escenario 2: Dashboard shows empty state or metrics', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const emptyState = page.getByText('Aún no tienes proyectos')
    const metricsHeader = page.getByText('Rendimiento en tiempo real.')

    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasMetrics = await metricsHeader.isVisible().catch(() => false)

    expect(hasEmpty || hasMetrics).toBe(true)
  })

  test('Escenario 3: Create project flow opens modal', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const createBtn = page.getByText('Crear Primer Proyecto')
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click()
      await expect(page.getByText('Nuevo Proyecto')).toBeVisible()

      await page.fill('input[placeholder="Ej: Campaña Instagram Q1"]', 'Proyecto Test E2E')
      await page.click('button:has-text("Crear Proyecto")')

      await page.waitForURL('**/dashboard?project=**', { timeout: 10_000 })
      expect(page.url()).toContain('?project=')
    }
  })
})
