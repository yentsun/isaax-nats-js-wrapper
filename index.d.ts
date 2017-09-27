import EventEmitter = require('events');

type ListenCallback = (this: void, message: any, respond: (error: Error, message: any) => void) => void;

type SubscribeCallback = (this: void, message: any, reply: string, subject: string) => void;

type ProcessCallback = (this: void, message: any, subject: string) => void;

type RequestCallback = (this: void, error: Error, response: any) => void;

declare class Wrapper extends EventEmitter {

    constructor(options: Wrapper.Options);

    /** Publish a message */
    publish(subject: string, message: any): void;

    /**
     * Subscribe to point-to-point requests
     * @return Subscriber Id
     */
    listen(subject: string, done: ListenCallback): number;

    /**
     * Subscribe to broadcasts
     * @return Subscriber Id
     */
    subscribe(subject: string, done: SubscribeCallback): number;

    /**
     * Subscribe as queue worker
     * @return Subscriber Id
     */
    process(subject: string, done: ProcessCallback): number;

    /** Publish a message and wait for the first response */
    request(subject: string, message: any, done: RequestCallback): void;

    /**
     * Unsubscribe from subject
     * @param [sid] Subscriber Id
     */
    unsubscribe(sid: number): void;

    /** Close underlying connection with NATS */
    close(): void;

}

declare namespace Wrapper {

    export interface Logger {
        info(message: string, ...meta: any[]): void;
        debug(message: string, ...meta: any[]): void;
        error(message: string, ...meta: any[]): void;
    }

    export interface Options {

        /** Request timeout */
        requestTimeout?: number;

        /** Existing NATS connection (if any) */
        connection?: any;

        /** URL for NATS to connect to (if no connection) */
        url?: string;

        /** TODO: Add description */
        group?: string;

        /** Overrides default logger */
        logger?: Logger;
    }

}

export = Wrapper;
