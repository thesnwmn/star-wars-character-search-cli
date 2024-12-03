import readline from 'readline/promises'
import chalk from 'chalk'

export interface PromptResult {
    input?: string
    aborted: boolean
}

interface PromptData {
    promise: Promise<PromptResult>
    abort: () => void
}

let activePrompt : PromptData = null

/**
 * Build a new prompt
 * @returns the promise of a prompt and the ability to cancel it
 */
function buildPrompt() : PromptData {

    const ac = new AbortController()

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return {
        promise:
            rl.question(chalk.blue('Who are you looking for? '), { signal: ac.signal })
                .then((input) => {
                    return { input, aborted: false }
                })
                .catch((err) => {
                    if (err.name === 'AbortError') {
                        return { aborted: true }
                    }
                    throw err
                })
                .finally(() => {
                    rl.close()
                    activePrompt = null
                }),
        abort: () => { ac.abort() }
    }
}

/**
 * Create a prompt for the user
 */
export function prompt() : Promise<PromptResult> {
    activePrompt = buildPrompt()
    return activePrompt.promise
}

/**
 * Abort the active prompt if there is one
 */
export function abortPrompt() {
    activePrompt?.abort()
}