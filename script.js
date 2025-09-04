import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { dom } from 'https://hamilsauce.github.io/hamhelper/modules/index.js';
// const { template, utils, dom } = ham;
import { randInt } from './lib/randomizer.js';
import { GameListModel } from './GameListModel.js';
import { mockSlots1 } from './mock-slot-list.js';
const { createDOM } = dom;

const app = document.querySelector('#app');
const appBody = app.querySelector('#app-body')
const gameGrid = appBody.querySelector('#game-grid')
const randomBtn = appBody.querySelector('#random-button')


// const flow = createFlowSequencer()

let gameList
setTimeout(() => {
  
  gameList = new GameListModel(gameGrid.children.length)
  window.gameList = gameList
  // const lowestValid = gameList.findLowestValid(5)
  // console.warn('lowestValid', lowestValid)
  
}, 0)

let cnt = 0
// const intId = setInterval(() => {
//   gameList.setSlotValue(cnt + 1, cnt)

//   if (intId > 10) {
//     const vItems = gameList.findValidSlots(5)
//     console.warn('vItems', vItems)
//     console.warn('gameList.slots', gameList.slots)

//     clearInterval(intId)

//   }
//   cnt++

//   console.log(' ', );
// }, 50)

const defaultColorStops = [
  { color: '#333136', stop: 40 },
  { color: '#272E32', stop: 100 }
]

// const invalidSlots = findValidSlots(mockSlots1, 60)
// const validSlots = mockSlots1.filter(({ id, value }) => !invalidSlots.includes(id));



// console.warn('invalidSlots, validSlots', invalidSlots, validSlots)

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
  // const lowestValid = gameList.findLowestValid(rando)
if (!unsetSlotIds.length) {
  randomBtn.value = 'LOSE'
  
}

  const rows = gameGrid.querySelectorAll('.row')
  
  rows.forEach((el, i) => {
    el.dataset.isOpen = false
    
  });
  unsetSlotIds.forEach((id, i) => {
    id++
    // const r = gameGrid.
    const r = gameGrid.querySelector(`.row[data-row-number="${id}"]`)
    r.dataset.isOpen = true
  });
});

gameGrid.addEventListener('click', e => {
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
        // attrs: { contenteditable: true },
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