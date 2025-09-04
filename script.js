import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { dom } from 'https://hamilsauce.github.io/hamhelper/modules/index.js';
import { randInt } from './lib/randomizer.js';
import { GameListModel } from './GameListModel.js';
import { mockSlots1 } from './mock-slot-list.js';
const { createDOM } = dom;

const app = document.querySelector('#app');
const appBody = app.querySelector('#app-body')
const gameGrid = appBody.querySelector('#game-grid')
const randomBtn = appBody.querySelector('#random-button')

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
  
  return +randomBtn.value
};

randomBtn.addEventListener('click', e => {
  if (randomBtn.value !== 'RANDO') {
    return
  }
  const rando = generateNewRando()
  const unsetSlotIds = gameList.findNullSlots(rando)
  if (!unsetSlotIds.length) {
    randomBtn.value = 'LOSE'
  }
  
  const rows = gameGrid.querySelectorAll('.row')
  
  rows.forEach((el, i) => {
    el.dataset.isOpen = false
    
  });
  unsetSlotIds.forEach((id, i) => {
    id++

    const r = gameGrid.querySelector(`.row[data-row-number="${id}"]`)
    r.dataset.isOpen = true
  });
});

const instruEl = document.querySelector('#instructions');

gameGrid.addEventListener('click', e => {
  if (instruEl.style.display !== 'none') {
    instruEl.style.display = 'none'
  }
  
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