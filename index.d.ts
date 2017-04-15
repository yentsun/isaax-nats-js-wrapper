// Type definitions for isaax-nats-js-wrapper 1.3.1

type ListenCallback = (this: void, message: any, respond: (error: Error, message: any) => void) => void;

type SubscribeCallback = (this: void, message: any, reply: string, subject: string) => void;

type ProcessCallback = (this: void, message: any, subject: string) => void;

type RequestCallback = (this: void, error: Error, response: any) => void;

declare class Wrapper {

    constructor(options: Wrapper.Options);

    /** Publish a message */
    publish(subject: string, message: any): void;

    /** Subscribe to point-to-point requests */
    listen(subject: string, done: ListenCallback): void;

    /** Subscribe to broadcasts */
    subscribe(subject: string, done: SubscribeCallback): void;

    /** Subscribe as queue worker */
    process(subject: string, done: ProcessCallback): void;

    /** Publish a message and wait for the first response */
    request(subject: string, message: any, done: RequestCallback): void;

    /** Close underlying connection with NATS */
    close(): void;

}

declare namespace Wrapper {

    export interface Options {

        /** Request timeout */
        requestTimeout?: number

        /** Existing NATS connection (if any) */
        connection?: any,

        /** URL for NATS to connect to (if no connection) */
        url?: string
    }

}

export = Wrapper;
