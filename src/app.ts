import chalk from 'chalk';
import { log } from './utils'
import { EventEmitter } from 'stream';
import { io, Socket } from 'socket.io-client'
import readline from 'readline'

const ADDRESS = 'http://localhost:3000'
const PROMPT = chalk.blue('Who are you looking for? ')

enum State {
    STARTING,
    CONNECTING,
    WAITING_USER_INPUT,
    SEARCHING,
    ERROR,
    STOPPED
}

interface Payload {
    error?: string
    page: number
    resultCount: number
    name?: string
    films?: string[]
}

function formatSearchResult(payload: Payload) : string {
    return `[${payload.page}/${payload.resultCount}] ` + chalk.green(payload.name) + ` (${payload.films.toString()})`
}

export class App {

    private emitter: EventEmitter = new EventEmitter();
    private socket: Socket = io(ADDRESS)
    private state: State = State.STARTING
    
    private readlineInterface : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    private inputAbortController : AbortController = null

    constructor(haltCallback: (reason: string) => void) {

        this.emitter.on('error', haltCallback)
        
        this.socket.on('connect',       this.onConnect.bind(this))
        this.socket.on('search',        this.onSearch.bind(this))
        this.socket.on('disconnect',    this.onDisconnect.bind(this))
        this.socket.on('connect_error', this.onConnectError.bind(this))

        this.awaitConnect()
    }

    /**
     * Stop the application
     */
    public stop() {
        this.state = State.STOPPED
        this.emitter.removeAllListeners()
        this.abortInput()
        this.socket.disconnect()
        this.readlineInterface.close()
    }

    /**
     * Internal callback for 'connect' socket event
     */
    private onConnect() {
        log.info("Connected")
        if (this.state === State.CONNECTING) {
            this.getInput()
        } else {
            this.raiseError(`Unexpected 'connect' event received in state ${this.state}`)
        }
    }

    /**
     * Internal callback for 'search' socket event
     */
    private onSearch(payload: Payload) {
        if (this.state === State.SEARCHING) {
            payload.error ?
                log.error(payload.error) :
                log.custom(formatSearchResult(payload))
            if (payload.page === payload.resultCount) {
                this.getInput()
            }
        } else {
            log.info(`Unexpected 'search' event received in state ${this.state}`)
        }
    }

    /**
     * Internal callback for 'disconnect' socket event
     */
    private onDisconnect() {
        this.abortInput()
        log.info('Disconnected')
        this.awaitConnect()
    }

    /**
     * Internal callback for 'connect_error' socket event
     * @param error error details
     */
    private onConnectError(error: Error) {
        if (this.state === State.CONNECTING) {
            if (!this.socket.active) {
                this.raiseError(`Connection error: ${error.message}`)
            }
        } else {
            this.raiseError(`Unexpected 'connect_error' event received in state ${this.state} (${error.message})`)
        }
    }

    /**
     * Raise an error to the outside world.
     * Message is supressed if the app has already been stopped or in an error state.
     * 
     * @param message Error message
     */
    private raiseError(message: string) {
        if (this.halted()) {
            log.info(`Supressing error in halted state (${this.state}): ${message}`)
        } else {
            this.state = State.ERROR
            this.emitter.emit('error', message)
        }
    }
    
    /**
     * Wait for a connection.
     * Essentially a no-op other than a state change
     */
    private awaitConnect() : void {
        if (this.halted()) return
        this.state = State.CONNECTING
        if (!this.socket.connected) {
            log.info('Connecting...')
        }
    }

    /**
     * Read user input from the command line
     */
    private getInput() : void {
        if (this.halted()) return
        this.state = State.WAITING_USER_INPUT
        this.inputAbortController = new AbortController()
        this.readlineInterface.question(PROMPT, { signal: this.inputAbortController.signal }, (input) => {
            this.inputAbortController = null
            this.runSearch(input)
        })
    }

    /**
     * Abort the input prompt
     */
    private abortInput() {
        if (this.inputAbortController !== null) {
            this.inputAbortController.abort()
        }
    }

    /**
     * Perform a search with the given query value
     * @param query string to search for
     */
    private runSearch(query: string) : void {
        if (this.halted()) return
        this.state = State.SEARCHING
        log.info(`Starting search for ${query}`)
        this.socket.emit('search', {query})
    }

    /**
     * Is the application in a halting state
     * @return whether the application has been stopped or errored
     */
    private halted() : boolean {
        return this.state === State.ERROR || this.state === State.STOPPED
    }
}