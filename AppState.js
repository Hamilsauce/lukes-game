import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';

export class AppState extends EventEmitter {
  #state = {}
  constructor(initialState = {}) {
    super();
    this.#state = { ...this.#state, ...initialState }
  }
  
  get(key) {
    return this.#state[key] ?? null;
  }
  
  update({ key, data }) {
  console.warn('data', data)
    if (key) {
      this.#state[key] = typeof data === 'object' ? { ...this.#state[key],  ...data } : data
      this.emit(`statechange:${key}`, this.#state[key])
    } else {
      this.#state = { ...this.#state, ...data }
      this.emit('statechange', this.#state)
    }
  }
}