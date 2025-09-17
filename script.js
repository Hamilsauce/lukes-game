import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { dom } from 'https://hamilsauce.github.io/hamhelper/modules/index.js';
import { randInt } from './lib/randomizer.js';
import { GameListModel } from './GameListModel.js';
import { mockSlots1 } from './mock-slot-list.js';
import { AppState } from './AppState.js';
const { createDOM } = dom;

export class UI {
  #isBizarroMode = false;
  
  constructor(root = document.querySelector('#app'), appState = new AppState()) {
    this.root = root;
    this.appState = appState;
    this.gameGrid = this.getEl('#game-grid')
    this.randomBtn = this.getEl('#random-button')
    this.instruEl = this.getEl('#instructions')
    this.appHeaderCenter = this.getEl('#app-header-center')
    this.scoreEl = this.getEl('#score-value')
    this.retriesEl = this.getEl('#retries-value')
    this.trashButton = this.getEl('#trash-icon')
    
    this.handleRetryClick = this.#handleRetryClick.bind(this)
    this.handleHeaderClick = this.#handleHeaderClick.bind(this)
    
    this.appHeaderCenter.addEventListener('click', this.handleHeaderClick)
    this.trashButton.addEventListener('click', this.handleRetryClick);
    
    let gradientDeg = 0
    setInterval(() => {
      this.root.style.background = `linear-gradient(${gradientDeg}deg, #2E2A32 40%, #23323B 100%)`
      gradientDeg++
    }, 16)
  };
  
  // get hasStarted() { return this.root.dataset.gameStarted === 'true' ? true : false; };
  get isBizarroMode() { return this.#isBizarroMode }
  get hasStarted() { return this.root.dataset.gameStarted === 'true' ? true : false; };
  get rows() { return this.getEls('.row'); };
  get retriesLeft() { return appState.get('retryLimit') - appState.get('retriesUsed') }
  
  #handleHeaderClick(e) {
    console.log('CLICK')
    if (!this.hasStarted) {
      this.root.dataset.isBizarroMode = true;
      this.appHeaderCenter.removeEventListener('click', this.handleHeaderClick)
    }
    
  };
  
  #handleRetryClick() {
    if (this.retriesLeft === 0) return
    const used = +appState.get('retriesUsed') + 1
    this.appState.update({ key: 'retriesUsed', data: +used })
    
    if (this.retriesLeft) {
      this.appState.update({
        key: 'currentNumber',
        data: 0, // randInt(1, 1000)
      })
    }
  };
  
  generateNewRando() {
    randomBtn.value = randInt(1, 1000)
    this.trashButton.dataset.hide = false;
    return +randomBtn.value
  };
  
  setButtonValue(v) {
    if (!v) {
      randomBtn.value = 'RANDO';
    }
    
    else {
      randomBtn.value = v;
    }
    
    if (isNaN(+v) || !this.retriesLeft) {
      this.trashButton.dataset.hide = true;
    }
  };
  
  getRowById(id) { return this.getEl(`.row[data-row-number="${id}"]`); }
  
  getEl(selector) { return this.root.querySelector(selector); }
  
  getEls(selector) { return [...this.root.querySelectorAll(selector)]; }
}

const appState = new AppState({
  gameStarted: false,
  retryLimit: 3,
  retriesUsed: 0,
  slotCount: 15,
  score: 0,
  currentNumber: null,
  turnStarted: false,
});


const app = document.querySelector('#app');
const appBody = app.querySelector('#app-body')
const gameGrid = appBody.querySelector('#game-grid')
const randomBtn = appBody.querySelector('#random-button')

const ui = new UI(app, appState);

appState.on('statechange:currentNumber', (currentNumber) => {
  ui.setButtonValue(currentNumber)
});

appState.on('statechange:retriesUsed', retriesUsed => {
  ui.retriesEl.textContent = `${retriesUsed}/${appState.get('retryLimit')}`;
});

let gameList

setTimeout(() => {
  gameList = new GameListModel(gameGrid.children.length)
  window.gameList = gameList
}, 0);

let cnt = 0;

const defaultColorStops = [
  { color: '#333136', stop: 40 },
  { color: '#272E32', stop: 100 }
];

const generateNewRando = () => {
  randomBtn.value = randInt(1, 1000)
  ui.trashButton.dataset.hide = false;
  return +randomBtn.value
};

randomBtn.addEventListener('click', e => {
  if (['START'].includes(randomBtn.value)) {
    app.dataset.gameStarted = true;
  }
  
  if (!['RANDO', 'START'].includes(randomBtn.value)) {
    return
  }
  const rando = generateNewRando()
  const unsetSlotIds = gameList.findNullSlots(rando)
  if (!unsetSlotIds.length) {
    randomBtn.value = 'LOSE'
    ui.trashButton.dataset.hide = true;
    
  }
  
  const rows = gameGrid.querySelectorAll('.row')
  
  rows.forEach((el, i) => {
    el.dataset.isOpen = false
  });
  
  unsetSlotIds.forEach((id, i) => {
    id++
    
    const r = gameGrid.querySelector(`.row[data-row-number="${id}"]`)
    // r.dataset.isOpen = ui.isBizarroMode ? true : false
    r.dataset.isOpen = true;
  });
});

const instruEl = document.querySelector('#instructions');

gameGrid.addEventListener('click', e => {
  if (instruEl.style.display !== 'none') {
    instruEl.style.display = 'none'
  }
  
  // if (instruEl.style.color !== 'transparent') {
  //   instruEl.style.color = 'transparent'
  // }
  
  const target = e.target
  const targetRow = target.closest('.row')
  const targetCell = targetRow.querySelector('.row-cell')
  
  const rowNumber = +targetRow.dataset.rowNumber
  
  const slotModel = gameList.findById(rowNumber)
  if (targetRow.dataset.isOpen === 'false' || targetRow.dataset.locked === 'true') {
    return
  }
  
  if (slotModel && !slotModel.isSet && randomBtn.value !== 'RANDO') {
    slotModel.setValue(+randomBtn.value)
    targetCell.textContent = randomBtn.value
    targetRow.classList.add('locked')
    targetRow.dataset.locked = true;
    randomBtn.value = 'RANDO'
    ui.trashButton.dataset.hide = true;
    
    const scoreEl = document.querySelector('#score-value')
    scoreEl.textContent = `${gameList.slotsWithValues.length}/${gameList.slots.length}`
  }
  
  if (randomBtn.value !== 'RANDO') {}
});

const generateGrid = (rowCount) => {
  const rows = new Array(rowCount).fill(null)
    .map((_, i) => {
      const rowNumber = i + 1;
      
      const rowHeader = createDOM('div', {
        dataset: { rowNumber },
        classList: ['row-header'],
        children: [`${rowNumber}`],
      });
      
      const rowCell = createDOM('div', {
        dataset: { rowNumber },
        classList: ['row-cell'],
      });
      
      const row = createDOM('div', {
        dataset: { rowNumber, isLocked: false },
        classList: ['row'],
        children: [rowHeader, rowCell],
      });
      
      return row;
    });
  return rows
};

const rows = generateGrid(15);

gameGrid.append(...rows);