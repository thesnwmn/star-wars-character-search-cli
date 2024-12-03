import chalk from 'chalk';

export const log = {
    info(message, ...args) {
        console.log(chalk.grey(message), ...args)
    },
    message(message, ...args) {
        console.log(chalk.white(message), ...args)
    },
    warn(message, ...args) {
        console.log(chalk.yellow(message), ...args)
    },
    error(message, ...args) {
        console.log(chalk.red(message), ...args)
    },
    custom(message, ...args) {
        console.log(message, ...args)
    }
}