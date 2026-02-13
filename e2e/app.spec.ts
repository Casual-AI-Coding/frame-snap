import { test, expect } from '@playwright/test'

test.describe('FrameSnap E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Home Page', () => {
    test('should display home page with logo', async ({ page }) => {
      await expect(page.locator('.logo-text')).toHaveText('FrameSnap')
      await expect(page.locator('.logo-sub')).toHaveText('帧像')
    })

    test('should display title and subtitle', async ({ page }) => {
      await expect(page.locator('.title')).toContainText('照片水印')
      await expect(page.locator('.subtitle')).toContainText('简单')
    })

    test('should navigate to editor page', async ({ page }) => {
      await page.click('.action-button:first-child')
      await expect(page).toHaveURL('/editor')
      await expect(page.locator('.title')).toHaveText('编辑器')
    })

    test('should navigate to templates page', async ({ page }) => {
      await page.click('.action-button:last-child')
      await expect(page).toHaveURL('/templates')
      await expect(page.locator('.title')).toHaveText('模板库')
    })
  })

  test.describe('Editor Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/editor')
    })

    test('should display editor layout', async ({ page }) => {
      await expect(page.locator('.header')).toBeVisible()
      await expect(page.locator('.sidebar')).toBeVisible()
      await expect(page.locator('section.canvas-container')).toBeVisible()
      await expect(page.locator('.footer')).toBeVisible()
    })

    test('should display tab navigation', async ({ page }) => {
      const tabs = page.locator('.tabs .tab')
      await expect(tabs).toHaveCount(3)
      await expect(tabs.nth(0)).toHaveText('水印')
      await expect(tabs.nth(1)).toHaveText('相框')
      await expect(tabs.nth(2)).toHaveText('拼图')
    })

    test('should switch between tabs', async ({ page }) => {
      // Default is watermark
      await expect(page.locator('.watermark-panel')).toBeVisible()

      // Switch to frame
      await page.click('.tabs .tab:has-text("相框")')
      await expect(page.locator('.frame-panel')).toBeVisible()

      // Switch to collage
      await page.click('.tabs .tab:has-text("拼图")')
      await expect(page.locator('.collage-panel')).toBeVisible()
    })

    test('should show empty state when no image', async ({ page }) => {
      await expect(page.locator('.empty-state')).toContainText('请先上传图片')
    })

    test('should have export button disabled when no image', async ({ page }) => {
      const exportBtn = page.locator('.export-button')
      await exportBtn.click()
      // Should show alert
      page.on('dialog', dialog => expect(dialog.message()).toContain('请先上传图片'))
    })

    test('should navigate back to home', async ({ page }) => {
      await page.click('.back-button')
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Templates Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/templates')
    })

    test('should display templates page layout', async ({ page }) => {
      await expect(page.locator('.header')).toBeVisible()
      await expect(page.locator('.main')).toBeVisible()
    })

    test('should display tab navigation', async ({ page }) => {
      const tabs = page.locator('.tabs .tab')
      await expect(tabs).toHaveCount(3)
    })

    test('should display template cards', async ({ page }) => {
      const cards = page.locator('.template-card')
      await expect(cards.first()).toBeVisible()
    })

    test('should have use, export buttons on template', async ({ page }) => {
      const firstCard = page.locator('.template-card').first()
      await expect(firstCard.locator('.action-btn')).toHaveCount(2) // Use and Export
    })

    test('should navigate back to home', async ({ page }) => {
      await page.click('.back-button')
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Navigation Flow', () => {
    test('should navigate through complete flow', async ({ page }) => {
      // Home -> Templates -> Home
      await page.goto('/templates')
      await expect(page).toHaveURL('/templates')
      await page.click('.back-button')
      await expect(page).toHaveURL('/')

      // Home -> Editor -> Home
      await page.goto('/editor')
      await expect(page).toHaveURL('/editor')
      await page.click('.back-button')
      await expect(page).toHaveURL('/')
    })
  })
})
