import {ILogObject, Logger, TLogLevelName, TTransportLogger} from 'tslog';
import { appendFileSync } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';


export class CustomLogger {
    private logger: Logger;

    constructor(
        private savePath: string,
        private saveLevel: TLogLevelName
    ) {
        this.logger = new Logger();
    }

    initialize = async () => {
        //only attach the logging to file function after the directory has been created 
        await mkdirp(path.dirname(this.savePath));
        //bind the transport function so we can access the savePath from this
        const boundTransport = this.logToTransport.bind(this);
        
        //attach all transports
        this.logger.attachTransport({
                silly: boundTransport,
                debug: boundTransport,
                trace: boundTransport,
                info: boundTransport,
                warn: boundTransport,
                error: boundTransport,
                fatal: boundTransport,
            },
            this.saveLevel);
    }

    silly(message: string): void {
        this.logger.silly(message);
    }

    debug(message: string): void {
        this.logger.debug(message);
    }

    trace(message: string): void {
        this.logger.trace(message);
    }

    info(message: string): void {
        this.logger.info(message);
    }
    warn(message: string): void {
        this.logger.warn(message);
    }
    error(message: string): void {
        this.logger.error(message);
    }
    
    fatal(message: string): void {
        this.logger.fatal(message);
    }

    logToTransport(logObject: ILogObject) {
        appendFileSync(this.savePath, JSON.stringify(logObject) + "\n");
    }

}