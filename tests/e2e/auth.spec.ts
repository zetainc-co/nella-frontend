import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('Login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@verify-corp.com')
    await page.fill('input[type="password"]', 'Admin1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 10_000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('Credenciales incorrectas muestra error en español', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    const errorText = page.locator('text=/credencial|inválid|incorrecto/i')
    await expect(errorText).toBeVisible({ timeout: 5_000 })
  })

  test('Logout redirige a /login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@verify-corp.com')
    await page.fill('input[type="password"]', 'Admin1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 10_000 })

    await page.click('button:has-text("Cerrar sesión")')
    await page.waitForURL('**/login**', { timeout: 5_000 })
    expect(page.url()).toContain('/login')
  })
})
