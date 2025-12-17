export class ListSlotModel extends EventTarget {
  #id;
  #value = null;
  
  constructor(id = 0) {
    super();
    
    this.#id = id;
  };
  
  get id() { return this.#id };
  
  get value() { return this.#value };
  
  get isSet() { return !!+this.#value };
  
  setValue(v = 0) {
    if (isNaN(+v)) throw new Error('bad value');
    if (!!+this.#value) throw new Error(`value already set for slot ${this.id}`);
    this.#value = v;
    
    this.dispatchEvent(new CustomEvent(`slotvalue:set`, { detail: { value: this.#value } }))
  }
  
  reset() {
    this.#value = null;
    
    this.dispatchEvent(new CustomEvent(`slotvalue:reset`, { detail: { value: this.#value } }))
  }
}

export class GameListModel extends EventTarget {
  #slots = [];
  
  constructor(slotCount = 15) {
    super();
    
    this.#slots = new Array(slotCount)
      .fill(null)
      .map((_, i) => new ListSlotModel(i + 1))
    
  };
  
  get slots() { return this.#slots }
  
  get emptySlots() { return this.findAll(_ => !_.isSet) };
  
  get slotsWithValues() { return this.findAll(_ => _.isSet) };
  
  get slottedCount() { return this.slotsWithValues.length };
  
  validateValue(v) { return !isNaN(+v) && +v > 0 }
  
  setSlotValue(slotID, value) {
    if (+value) {
      this.findById(slotID).setValue(value);
    }
    
    return this;
  }
  
  hasValueSlotted(value) {
    if (!value) return;
    return this.slots.some(_ => _.value === value);
  }
  
  findById(id) {
    return this.slots.find(_ => _.id === id);
  }
  
  findAll(cb) {
    return this.slots.filter(cb);
  }
  
  findNullSlots(target) {
    const arr = this.slots.map((_, i) => _.value);
    
    let left = null,
      right = null;
    
    // Step 1: Find left/right numeric neighbors
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == null) continue;
      
      if (arr[i] === target) {
        return []; // exact match → no slots
      }
      
      if (arr[i] < target) {
        left = i;
      } else if (arr[i] > target) {
        right = i;
        break;
      }
    }
    
    const nullSlots = [];
    
    if (left !== null && right !== null) {
      for (let i = left + 1; i < right; i++) {
        if (arr[i] === null) nullSlots.push(i);
      }
    } else if (left === null && right !== null) {
      for (let i = 0; i < right; i++) {
        if (arr[i] === null) nullSlots.push(i);
      }
    } else if (left !== null && right === null) {
      for (let i = left + 1; i < arr.length; i++) {
        if (arr[i] === null) nullSlots.push(i);
      }
    } else {
      // No neighbors → all nulls
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === null) nullSlots.push(i);
      }
    }
    
    return nullSlots;
  }
}