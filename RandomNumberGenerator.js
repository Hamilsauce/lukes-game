import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js'

export class RandomNumberGenerator extends EventEmitter{
  constructor(min, max, ) {
    super();
    
  };
  
  
  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}