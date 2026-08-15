import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.padLevels(),
      ),
    }),
    new winston.transports.Console({
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.padLevels(),
      ),
    }),
  ],
});

export default logger;
