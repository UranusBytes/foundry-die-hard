export function dieHardLog(force, ...args) {
  try {
    const isDebugging = game.modules.get('_dev-mode')?.api?.getPackageDebugValue('foundry-die-hard');

    if (force || isDebugging) {
      console.log('DieHard', '|', ...args);
    }
  } catch (e) {}
}

export function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}