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
  
  get slots() { return this.#slots };
  
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
    
    // Step 2: Collect nulls in the proper span
    const nullSlots = [];
    
    if (left !== null && right !== null) {
      // Between left and right
      for (let i = left + 1; i < right; i++) {
        if (arr[i] === null) nullSlots.push(i);
      }
    } else if (left === null && right !== null) {
      // From start to right
      for (let i = 0; i < right; i++) {
        if (arr[i] === null) nullSlots.push(i);
      }
    } else if (left !== null && right === null) {
      // From left to end
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
  
  findLowestValid(value) {
    const slots = [...this.slotsWithValues];
    
    if (this.slottedCount === slots.length) return null;
    if (this.emptySlots.length === slots.length) return slots[0];
    if (this.hasValueSlotted(value)) return null;
    
    let cnt = 0;
    let valids = [];
    let curr = slots[cnt];
    let prev = null;
    
    
    while (curr) {
      prev = curr;
      curr = slots[cnt];
      
      const currValue = curr?.value;
      const prevValue = prev?.value;
      // console.warn('prevValue && prevValue < value', !!prevValue && +prevValue < +value)
      if (!currValue && !!prevValue && +prevValue < +value) {
        
        valids.push(curr);
      }
      
      if (+prevValue && +prevValue < +value) {}
      
      // console.warn('cnt', cnt)
      // console.warn('prev', prev)
      // console.warn('curr', curr)
      
      cnt++
    }
    
    // for (let i = 0; i < slots.length; i++) {
    //   curr = slots[i]
    //   console.warn('curr, prev', curr, prev)
    //   if (
    //     (prev && !!prev.value) && (curr && !(!!curr.value)) &&
    //     prev.value < value
    //   ) {
    //     return curr
    //   }
    
    //   if (curr && !!curr.value && curr.value < value) {
    //     prev = curr
    //   }
    
    //   // if (curr && !curr.value) {
    //   //   return curr
    //   // }
    // }
    
    return curr;
  }
  
  findValidSlots(value) {
    const valid = new Set();
    const slots = this.slots;
    
    let a
    let b
    
    for (let i = 0; i < slots.length; i++) {
      
      for (let j = i + 1; j < slots.length; j++) {
        a = slots[i];
        b = slots[j];
        console.warn('a, b', a.id, b.id)
        
        if (
          (a.value > value && value < b.value) ||
          (b.value < value && value > a.value)
        ) {
          if (j > i + 1) {
            for (let k = i + 1; k < j; k++) {
              valid.add(k);
            }
          }
        }
        
      }
    }
    
    return [...valid].sort((a, b) => a - b);
  }
  
  findValidSlotsGPT(value) {
    const valid = new Set();
    const slots = this.slots;
    
    let a
    let b
    
    for (let i = 0; i < slots.length; i++) {
      
      for (let j = i + 1; j < slots.length; j++) {
        a = slots[i];
        b = slots[j];
        
        if (
          (a.value > value && value < b.value) ||
          (b.value < value && value > a.value)
        ) {
          if (j > i + 1) {
            for (let k = i + 1; k < j; k++) {
              valid.add(k);
            }
          }
        }
        
      }
    }
    
    return [...valid].sort((a, b) => a - b);
  }
}