/**
 * Entry point file.
 */

import { App } from './app'
import { log } from './utils'

let app: App

/**
 * Construct an instance of the app with a callback hook to restart it
 * in the case of a halting error. Timeouts as a caution to allow the
 * event loop to run.
 */
function start() {
    app = new App((reason: string) => {
        log.error(`\nRestarting due to fatal error: ${reason}`)
        setTimeout(() => {
            app.stop()
            setTimeout(() => {
                start()
            })
        })
    })
}

start()