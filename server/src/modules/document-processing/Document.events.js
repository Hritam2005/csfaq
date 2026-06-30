import EventEmitter from 'events';

class DocumentEventEmitter extends EventEmitter {}

export const documentEvents = new DocumentEventEmitter();
