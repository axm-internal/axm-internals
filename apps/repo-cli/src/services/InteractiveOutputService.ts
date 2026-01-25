import { CliOutputService } from '@axm-internal/cli-kit';
import { renderJson } from '@axm-internal/git-db/src/utils/dataRenderer';
import yoctoSpinner from 'yocto-spinner';
import { blue, green, red, yellow } from 'yoctocolors';

export type LogType = 'success' | 'error' | 'warning' | 'info' | 'none';
export type Format = (string: string) => string;

const type2ColorFunc = (type?: LogType): Format => {
    switch (type) {
        case 'success':
            return green;

        case 'error':
            return red;

        case 'warning':
            return yellow;

        case 'info':
            return blue;
        default:
            return (text: string) => text;
    }
};

export class InteractiveOutputService extends CliOutputService {
    startSpinner(text?: string) {
        return yoctoSpinner({ text, color: 'blue' }).start();
    }

    logType({ type = 'info', message, obj }: { type?: LogType; message: string; obj?: unknown }) {
        const colorFunc = type2ColorFunc(type);

        let text = message;
        if (obj !== undefined) {
            text += ` ${renderJson(obj)}`;
        }
        console.log(colorFunc(text));
    }

    override log(message: string) {
        this.logType({
            message,
        });
    }

    override logSuccess(message: string) {
        this.logType({
            type: 'success',
            message,
        });
    }

    override logError(message: string) {
        this.logType({
            type: 'error',
            message,
        });
    }
}
