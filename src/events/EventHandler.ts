export interface EventHandler {
	eventName: string;
	process(...args: any[]): Promise<void>;
}
