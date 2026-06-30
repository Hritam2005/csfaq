import EventEmitter from 'events';

class SearchEventEmitter extends EventEmitter {}

export const searchEvents = new SearchEventEmitter();
