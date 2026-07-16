import { type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Shared helper methods used across tests and page objects.
 */
export class CommonUtils {
  /**
   * Waits for the given number of milliseconds.
   * @param milliseconds time to wait
   */
  static async wait(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Captures a screenshot of the current page.
   * Saved under screenshots/ with an optional custom name, or a timestamped name.
   */
  static async takeScreenshot(page: Page, name?: string): Promise<string> {
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const fileName = name
      ? name.endsWith('.png')
        ? name
        : `${name}.png`
      : `screenshot_${CommonUtils.getCurrentDate()}.png`;

    const filePath = path.join(screenshotsDir, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * Returns a random number with exactly the given number of digits.
   * Example: getRandomNumber(3) → 100–999
   */
  static getRandomNumber(digit: number): number {
    if (digit < 1) {
      throw new Error('digit must be at least 1');
    }
    const min = Math.pow(10, digit - 1);
    const max = Math.pow(10, digit) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Returns the current date/time as ddMonYYYY_hhmmss.
   * Example: 15Jul2026_095156
   */
  static getCurrentDate(): string {
    const now = new Date();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const dd = String(now.getDate()).padStart(2, '0');
    const mon = months[now.getMonth()];
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return `${dd}${mon}${yyyy}_${hh}${mm}${ss}`;
  }
}
