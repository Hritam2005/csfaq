import EventEmitter from 'events';

class KnowledgeEventEmitter extends EventEmitter {}

export const knowledgeEvents = new KnowledgeEventEmitter();
