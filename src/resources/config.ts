import { readFileSync } from 'fs';
import path from 'path';

//the settings in config.json. the optional ones are missing from most config files
export interface Config {
	token: string;
	mode: string;
	test_server: string;
	error_channel: string;
	message: string;
	owner: string;
	production_host?: string;
	youtube_cookie?: string;
	youtube_cookie_file?: string;
	metrics_port?: string | number;
	nasa_token?: string;
	stock_token?: string;
	weather_token?: string;
}

//read from the project folder when the bot starts, so a change to config.json only needs a restart.
//importing the file instead made the build keep its own copy in built/, and edits did nothing
//until the next build. built/src/resources is three folders below the project folder
const file = path.resolve(__dirname, '../../../config.json');
function readConfig(): Config {
	try {
		//some Windows editors start the file with an invisible byte order mark, which JSON can't read
		return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
	} catch (error) {
		throw new Error(`Could not read ${file}. It must exist and be valid JSON saved as UTF-8: ${error instanceof Error ? error.message : error}`);
	}
}
const config = readConfig();
export default config;

//an optional text setting, or undefined when it's missing or left empty
export function configText(key: keyof Config): string | undefined {
	const value = config[key];
	return typeof value === 'string' && value.trim().length ? value : undefined;
}
