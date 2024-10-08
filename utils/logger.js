const path = require('path');

async function functionTraceEmit(execTime) {
    try {
        const stack = new Error().stack;
        const stackLines = stack.split('\n');
        stackLines.shift();
        const functionNameMatch = stackLines[1].match(/Object\.([^\s]+) \((.*):(\d+):(\d+)\)/);
        const functionName = functionNameMatch ? functionNameMatch[1] : 'Unknown function';
        const filePath = functionNameMatch ? functionNameMatch[2] : 'Unknown file';
        const fileName = filePath ? path.basename(filePath) : 'Unknown file';
        const lineNumberMatch = stackLines[1].match(/:(\d+):\d+\)$/);
        const lineNumber = lineNumberMatch ? lineNumberMatch[1] : 'Unknown line';

        let time;
        if (execTime < 100) {
            time = '\x1b[32m' + execTime + 'ms \x1b[0m';
        } else if (execTime > 100 && execTime < 200) {
            time = '\x1b[33m' + execTime + 'ms \x1b[0m';
        } else {
            time = '\x1b[31m' + execTime + 'ms \x1b[0m';
        }

        console.log(`Function called \x1b[35m${functionName}\x1b[0m at \x1b[33m${fileName}\x1b[0m on line ${lineNumber} :: Execution time ${time}`);
    } catch (err) {
        console.error(err.message);
    }
}

async function executionTime(startTime, endTime) {
    try {
        let start = (!startTime) ? Date.now() : startTime;
        return (!endTime && startTime) ? Date.now() - startTime : start;
    } catch (err) {
        console.error(err.message);
    }
}

async function functionTraceEmitError(err) {
    try {
        const stackLines = err.stack.split('\n');
        const errorLocation = stackLines[1].trim();
        const functionNameMatch = errorLocation.match(/Object\.([^\s]+) \((.*):(\d+):(\d+)\)/);
        const functionName = functionNameMatch ? functionNameMatch[1] : 'Unknown function';
        const filePath = functionNameMatch ? functionNameMatch[2] : 'Unknown file';
        const fileName = filePath ? path.basename(filePath) : 'Unknown file';
        const lineNumberMatch = errorLocation.match(/:(\d+):\d+\)$/);
        const lineNumber = lineNumberMatch ? lineNumberMatch[1] : 'Unknown line';

        console.log(`\x1b[31mError\x1b[0m on function \x1b[35m${functionName}\x1b[0m at \x1b[33m${fileName}\x1b[0m on line ${lineNumber} -- ${filePath}`);
    } catch (err) {
        const stackLines = err.stack.split('\n');
        const errorLocation = stackLines[1].trim();
        console.log(`\x1b[31mError\x1b[0m \x1b[33m${errorLocation} \x1b[0m`);
    }
}

module.exports = {
    executionTime,
    functionTraceEmit,
    functionTraceEmitError,
}