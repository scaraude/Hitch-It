import { consoleTransport, logger as rnLogger } from 'react-native-logs';

export enum LogLevel {
	Debug = 'debug',
	Info = 'info',
	Warn = 'warn',
	Error = 'error',
}

export enum LogContext {
	Spot = 'SPOT',
	Journey = 'JOURNEY',
	Location = 'LOCATION',
	Database = 'DATABASE',
	UI = 'UI',
	App = 'APP',
	Repository = 'REPOSITORY',
	Navigation = 'NAVIGATION',
}

const config = {
	levels: {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	},
	severity: __DEV__ ? 'debug' : 'info',
	transport: consoleTransport,
	transportOptions: {
		colors: {
			debug: 'blueBright' as const,
			info: 'greenBright' as const,
			warn: 'yellowBright' as const,
			error: 'redBright' as const,
		},
	},
	async: true,
	dateFormat: 'time' as const,
	printLevel: true,
	printDate: true,
	enabled: true,
};

const baseLogger = rnLogger.createLogger(config);

class Logger {
	private context: LogContext;

	constructor(context: LogContext) {
		this.context = context;
	}

	private formatMessage(
		message: string,
		metadata?: Record<string, unknown>
	): string {
		const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
		return `[${this.context}] ${message}${metaStr}`;
	}

	debug(message: string, metadata?: Record<string, unknown>): void {
		baseLogger.debug(this.formatMessage(message, metadata));
	}

	info(message: string, metadata?: Record<string, unknown>): void {
		baseLogger.info(this.formatMessage(message, metadata));
	}

	warn(message: string, metadata?: Record<string, unknown>): void {
		baseLogger.warn(this.formatMessage(message, metadata));
	}

	error(
		message: string,
		error?: Error | unknown,
		metadata?: Record<string, unknown>
	): void {
		const errorDetails =
			error instanceof Error
				? { name: error.name, message: error.message, stack: error.stack }
				: { error };

		const combinedMeta = { ...metadata, ...errorDetails };
		baseLogger.error(this.formatMessage(message, combinedMeta));
	}
}

export const createLogger = (context: LogContext): Logger => {
	return new Logger(context);
};

export const logger = {
	spot: createLogger(LogContext.Spot),
	journey: createLogger(LogContext.Journey),
	location: createLogger(LogContext.Location),
	database: createLogger(LogContext.Database),
	ui: createLogger(LogContext.UI),
	app: createLogger(LogContext.App),
	repository: createLogger(LogContext.Repository),
	navigation: createLogger(LogContext.Navigation),
};
