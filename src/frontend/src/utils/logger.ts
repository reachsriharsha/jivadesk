/**
 * Frontend Logging Utility
 *
 * STRICT RULE: Every log entry MUST include contextual data.
 * Plain English statements without data are NOT allowed.
 *
 * File name and line number are automatically captured - no manual input needed.
 *
 * Usage:
 *   logger.info('login_success', { userId: user.id, email: user.email });
 *   logger.error('api_call_failed', { endpoint: '/auth/login', status: 401, error: 'Unauthorized' });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: string | number | boolean | null | undefined;
}

interface CallerInfo {
  fileName: string;
  lineNumber: string;
}

class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = import.meta.env.DEV;
  }

  /**
   * Extract file name and line number from Error stack trace
   * This is done automatically - no manual input needed
   */
  private getCallerInfo(): CallerInfo {
    const error = new Error();
    const stack = error.stack || '';
    const stackLines = stack.split('\n');

    // Stack trace format varies by browser, but generally:
    // Chrome/Edge: "    at functionName (file:line:col)"
    // Firefox: "functionName@file:line:col"
    // Safari: "functionName@file:line:col"

    // Skip first 3 lines: Error, getCallerInfo, log method, actual logger method (info/error/etc)
    // The 4th line (index 3 or 4) should be the actual caller
    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i];

      // Skip internal logger calls
      if (line.includes('logger.ts') || line.includes('Logger.')) {
        continue;
      }

      // Chrome/Edge format: "    at functionName (http://localhost:5173/src/stores/authStore.ts:35:12)"
      // or "    at http://localhost:5173/src/stores/authStore.ts:35:12"
      const chromeMatch = line.match(/(?:at\s+)?(?:.*?\s+\()?(?:.*?\/src\/(.+?)):(\d+):\d+\)?/);
      if (chromeMatch) {
        return {
          fileName: chromeMatch[1],
          lineNumber: chromeMatch[2],
        };
      }

      // Firefox/Safari format: "functionName@http://localhost:5173/src/stores/authStore.ts:35:12"
      const firefoxMatch = line.match(/@(?:.*?\/src\/(.+?)):(\d+):\d+/);
      if (firefoxMatch) {
        return {
          fileName: firefoxMatch[1],
          lineNumber: firefoxMatch[2],
        };
      }

      // Fallback: try to extract any file:line pattern
      const fallbackMatch = line.match(/([^\/\s]+\.[tj]sx?):(\d+)/);
      if (fallbackMatch) {
        return {
          fileName: fallbackMatch[1],
          lineNumber: fallbackMatch[2],
        };
      }
    }

    return { fileName: 'unknown', lineNumber: '0' };
  }

  private formatData(data: LogData): string {
    return Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${value}`)
      .join(' | ');
  }

  private log(level: LogLevel, action: string, data: LogData = {}): void {
    const timestamp = new Date().toISOString();
    const caller = this.getCallerInfo();
    const location = `${caller.fileName}:${caller.lineNumber}`;
    const formattedData = this.formatData(data);
    const message = formattedData ? `${action} | ${formattedData}` : action;

    // Console output with color coding
    const styles: Record<LogLevel, string> = {
      debug: 'color: #888',
      info: 'color: #2196F3',
      warn: 'color: #FF9800',
      error: 'color: #F44336',
    };

    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${location}]`;

    switch (level) {
      case 'debug':
        if (this.isDev) {
          console.debug(`%c${prefix} ${message}`, styles[level], data);
        }
        break;
      case 'info':
        console.info(`%c${prefix} ${message}`, styles[level], data);
        break;
      case 'warn':
        console.warn(`%c${prefix} ${message}`, styles[level], data);
        break;
      case 'error':
        console.error(`%c${prefix} ${message}`, styles[level], data);
        break;
    }

    // In production, you could send logs to a logging service here
    // if (!this.isDev) {
    //   this.sendToLoggingService({ timestamp, level, location, action, data });
    // }
  }

  /**
   * Debug level - detailed flow information (development only)
   * @param action - The action being logged (e.g., 'api_request_start')
   * @param data - Contextual data object with key-value pairs
   */
  debug(action: string, data: LogData = {}): void {
    this.log('debug', action, data);
  }

  /**
   * Info level - key actions and state changes
   * @param action - The action being logged (e.g., 'login_success')
   * @param data - Contextual data object with key-value pairs
   */
  info(action: string, data: LogData = {}): void {
    this.log('info', action, data);
  }

  /**
   * Warn level - recoverable issues
   * @param action - The action being logged (e.g., 'validation_warning')
   * @param data - Contextual data object with key-value pairs
   */
  warn(action: string, data: LogData = {}): void {
    this.log('warn', action, data);
  }

  /**
   * Error level - failures with full context
   * @param action - The action being logged (e.g., 'api_call_failed')
   * @param data - Contextual data object with key-value pairs
   */
  error(action: string, data: LogData = {}): void {
    this.log('error', action, data);
  }
}

export const logger = new Logger();
