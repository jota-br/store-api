async function functionTraceEmit(functionName, params, execTime) {
    try {
        console.log(`Function called \x1b[35m ${functionName} \x1b[0m :: with parameters \x1b[34m ${JSON.stringify(params)} \x1b[0m :: \x1b[32m ${execTime}ms \x1b[0m`);
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

async function functionTraceEmitError(functionName, params, error) {
    try {
        console.log(`\x1b[31mError \x1b[0m on Function \x1b[35m ${functionName} \x1b[0m :: with parameters \x1b[34m ${JSON.stringify(params)} \x1b[0m :: Error: ${error}`);
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = {
    functionTraceEmit,
    executionTime,
    functionTraceEmitError,
}