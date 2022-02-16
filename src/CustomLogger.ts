import {ILogObject, Logger, TLogLevelName} from 'tslog';
import { appendFile } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';



export class CustomLogger {
    public logger: Logger;

    constructor(
        private savePath: string,
        private saveLevel: TLogLevelName
    ) {
        this.logger = new Logger();
        //only attach the logging to file function after the directory has been created
        mkdirp(path.dirname(this.savePath)).then(() => {
            this.logger.attachTransport({
                silly: this.logToTransport,
                debug: this.logToTransport,
                trace: this.logToTransport,
                info: this.logToTransport,
                warn: this.logToTransport,
                error: this.logToTransport,
                fatal: this.logToTransport,
              },
              this.saveLevel)
        });        
    }

    logToTransport(logObject: ILogObject) {
        appendFile(this.savePath, JSON.stringify(logObject), (err) => {
            if (err) console.log(err); // there's an error in the logger, so we should hard print to console
        });
    }

}