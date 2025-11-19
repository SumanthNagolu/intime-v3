/**
 * Logger - Simple logging utility
 */

import chalk from 'chalk';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || 'info';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

export const logger = {
  debug: (message: string) => {
    if (shouldLog('debug')) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  },

  info: (message: string) => {
    if (shouldLog('info')) {
      console.log(chalk.blue(`[INFO] ${message}`));
    }
  },

  warn: (message: string) => {
    if (shouldLog('warn')) {
      console.log(chalk.yellow(`[WARN] ${message}`));
    }
  },

  error: (message: string) => {
    if (shouldLog('error')) {
      console.log(chalk.red(`[ERROR] ${message}`));
    }
  },

  success: (message: string) => {
    if (shouldLog('info')) {
      console.log(chalk.green(`[SUCCESS] ${message}`));
    }
  },
};
