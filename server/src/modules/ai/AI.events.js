import EventEmitter from 'events';

class AIEventEmitter extends EventEmitter {}

export const aiEvents = new AIEventEmitter();
