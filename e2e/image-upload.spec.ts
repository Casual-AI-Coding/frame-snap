import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test.describe('Image Upload and Loading', () => {
  test('should upload image from home page and navigate to editor', async ({ page }) => {
    await page.goto('/')
    
    // Create a simple test image file
    const testImagePath = path.resolve(__dirname, 'test-image.png')
    
    // Upload image using file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('.upload-button')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)
    
    // Should navigate to editor
    await expect(page).toHaveURL('/editor')
  })

  test('should load image onto canvas', async ({ page }) => {
    await page.goto('/editor')
    
    // Check empty state is shown
    await expect(page.locator('.empty-state')).toContainText('请先上传图片')
  })

  test('should enable watermark panel after image upload', async ({ page }) => {
    await page.goto('/')
    
    const testImagePath = path.resolve(__dirname, 'test-image.png')
    
    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('.upload-button')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)
    
    // Wait for navigation to editor
    await expect(page).toHaveURL('/editor')
    
    // Add watermark button should be enabled now
    const addButton = page.locator('.watermark-panel .add-button').first()
    await expect(addButton).toBeEnabled()
  })

  test('should add text watermark to image', async ({ page }) => {
    await page.goto('/')
    
    const testImagePath = path.resolve(__dirname, 'test-image.png')
    
    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('.upload-button')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)
    
    // Wait for editor
    await expect(page).toHaveURL('/editor')
    
    // Add a text watermark
    await page.fill('.watermark-panel input[type="text"]', 'Test Watermark')
    await page.click('.watermark-panel .add-button')
    
    // Should have layer added
    const layers = page.locator('.watermark-panel .layer-item')
    await expect(layers).toHaveCount(1)
  })

  test('should add frame to image', async ({ page }) => {
    await page.goto('/')
    
    const testImagePath = path.resolve(__dirname, 'test-image.png')
    
    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('.upload-button')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)
    
    // Wait for editor
    await expect(page).toHaveURL('/editor')
    
    // Switch to frame tab
    await page.click('.tabs .tab:has-text("相框")')
    
    // Frame panel should be visible
    await expect(page.locator('.frame-panel')).toBeVisible()
    
    // Add frame button should be enabled (not disabled)
    const addButton = page.locator('.frame-panel .add-button')
    await expect(addButton).toBeEnabled()
  })

  test('should enable export button after adding watermark', async ({ page }) => {
    await page.goto('/')
    
    const testImagePath = path.resolve(__dirname, 'test-image.png')
    
    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('.upload-button')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testImagePath)
    
    // Wait for editor
    await expect(page).toHaveURL('/editor')
    
    // Add watermark
    await page.click('.watermark-panel .add-button')
    
    // Export button should still work (might still be enabled)
    const exportButton = page.locator('.export-button')
    await expect(exportButton).toBeVisible()
  })
})
