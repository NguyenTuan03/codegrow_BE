const { createLogger, format, transports } =require('winston');
const { combine, timestamp, label, printf, colorize, prettyPrint } = format;
const logFormat = printf(({level,message,label, timestamp}) => {
    return `${timestamp} [${label}] ${level}: ${message} `
})

const getLogger = (customerLable) => {
    return createLogger({
        format: combine(
            timestamp({format:"DD-MM-YYYY HH:mm:ss"}),
            label({label:customerLable}),
            prettyPrint(),
            logFormat
        ),
        transports: [
            new transports.Console({
              format: combine(colorize(), logFormat),
            }),
        ],
    })
}
module.exports = getLogger; 