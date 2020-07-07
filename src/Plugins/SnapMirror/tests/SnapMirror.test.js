import {
  createSandbox,
  waitForRequestAnimationFrame,
  clickMouse,
  moveMouse,
  releaseMouse,
  waitForDragDelay,
  waitForPromisesToResolve,
} from 'helper';
import {Draggable} from '../../..';
import SnapMirror from '..';

const sampleMarkup = `
  <ul class="Container">
    <li class="Item">item1</li>
    <li class="Item">item2</li>
  </ul>
`;

describe('SnapMirror', () => {
  let sandbox;
  let containers;
  let draggable;
  let draggables;
  let item1;
  let item2;

  beforeEach(() => {
    sandbox = createSandbox(sampleMarkup);
    containers = sandbox.querySelectorAll('.Container');
    draggables = sandbox.querySelectorAll('li');

    item1 = draggables[0];
    item2 = draggables[1];

    mockDimensions(containers[0], [0, 1000, 1000, 0]);
    mockDimensions(item1, [0, 30, 30, 0]);
    mockDimensions(item2, [30, 60, 60, 30]);
  });

  afterEach(() => {
    draggable.destroy();
    sandbox.parentNode.removeChild(sandbox);
  });

  it('snap to targets', async () => {
    draggable = new Draggable(containers, {
      draggable: 'li',
      plugins: [SnapMirror],
      SnapMirror: {
        targets: [
          {x: 100, y: 100},
          function() {
            return {x: 200, y: 200};
          },
        ],
      },
    });
    clickMouse(item1, {clientX: 15, clientY: 15});

    waitForDragDelay();
    waitForRequestAnimationFrame();
    await waitForPromisesToResolve();

    const mirror = document.querySelector('.draggable-mirror');

    moveMouse(document.body, {clientX: 50, clientY: 10});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(100px, 100px, 0)');

    moveMouse(document.body, {clientX: 220, clientY: 180});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(200px, 200px, 0)');

    releaseMouse(item1);
  });

  it('offset option', async () => {
    draggable = new Draggable(containers, {
      draggable: 'li',
      plugins: [SnapMirror],
      SnapMirror: {
        offset: {x: 30, y: 70},
        targets: [{x: 100, y: 100}],
      },
    });
    clickMouse(item1, {clientX: 10, clientY: 10});

    waitForDragDelay();
    waitForRequestAnimationFrame();
    await waitForPromisesToResolve();

    const mirror = document.querySelector('.draggable-mirror');

    moveMouse(document.body, {clientX: 50, clientY: 50});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(130px, 170px, 0)');

    releaseMouse(item1);
  });

  it('relativePoints option', async () => {
    draggable = new Draggable(containers, {
      draggable: 'li',
      plugins: [SnapMirror],
      SnapMirror: {
        relativePoints: [{x: 0.3, y: 0.7}],
        targets: [{x: 100, y: 100}],
      },
    });
    clickMouse(item1, {clientX: 10, clientY: 10});

    waitForDragDelay();
    waitForRequestAnimationFrame();
    await waitForPromisesToResolve();

    const mirror = document.querySelector('.draggable-mirror');

    moveMouse(document.body, {clientX: 50, clientY: 50});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(91px, 79px, 0)');

    releaseMouse(item1);
  });

  it('SnapMirror.grid', async () => {
    draggable = new Draggable(containers, {
      draggable: 'li',
      plugins: [SnapMirror],
      SnapMirror: {
        targets: [SnapMirror.grid({x: 50, y: 50})],
      },
    });
    clickMouse(item1, {clientX: 10, clientY: 10});

    waitForDragDelay();
    waitForRequestAnimationFrame();
    await waitForPromisesToResolve();

    const mirror = document.querySelector('.draggable-mirror');

    moveMouse(document.body, {clientX: 20, clientY: 10});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(0px, 0px, 0)');

    moveMouse(document.body, {clientX: 60, clientY: 10});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(50px, 0px, 0)');

    moveMouse(document.body, {clientX: 40, clientY: 40});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(50px, 50px, 0)');

    moveMouse(document.body, {clientX: 440, clientY: 550});
    await waitForPromisesToResolve();
    waitForRequestAnimationFrame();
    expect(mirror.style.transform).toBe('translate3d(450px, 550px, 0)');

    releaseMouse(item1);
  });
});

function mockDimensions(element, [top, right, bottom, left]) {
  const width = right - left;
  const height = bottom - top;
  Object.assign(element.style, {
    width: `${width}px`,
    height: `${height}px`,
  });

  element.getBoundingClientRect = () => ({
    width,
    height,
    top,
    right,
    bottom,
    left,
    x: top,
    y: left,
  });

  element.cloneNode = function(...args) {
    const node = Node.prototype.cloneNode.apply(element, args);
    node.getBoundingClientRect = function() {
      return element.getBoundingClientRect();
    };
    return node;
  };

  return element;
}