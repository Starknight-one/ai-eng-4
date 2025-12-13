interface Logger {
  info: (message: string, data?: unknown) => void;
  error: (message: string, error?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
}

export const logger: Logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error instanceof Error ? error.message : error);
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, data ? JSON.stringify(data) : '');
  }
};

export default logger;
