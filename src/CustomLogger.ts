import { ILogObject, Logger, TLogLevelName } from 'tslog';
import { appendFile } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

export class CustomLogger extends Logger {
  constructor(private savePath: string, private saveLevel: TLogLevelName) {
    super();
  }

  async initialize() {
    //only attach the logging to file function after the directory has been created
    await mkdirp(path.dirname(this.savePath));
    //bind the transport function so we can access the savePath from this
    const boundTransport = this.logToTransport.bind(this);

    //attach all transports
    this.attachTransport(
      {
        silly: boundTransport,
        debug: boundTransport,
        trace: boundTransport,
        info: boundTransport,
        warn: boundTransport,
        error: boundTransport,
        fatal: boundTransport,
      },
      this.saveLevel
    );
  }

  logToTransport(logObject: ILogObject) {
    appendFile(this.savePath, JSON.stringify(logObject) + '\n', (err) => {
      if (err) console.log(err); //something is wrong in logging, print directly to console
    });
  }
}
