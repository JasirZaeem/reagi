import { createRootFiber } from "./fiber.js";
import { renderState } from "./renderer.js";
import { queueTask } from "./scheduler.js";

export const STATE_HOOK = "useState";

export function useState(initial) {
	const fiber = renderState.currentFiber;
	const oldHook = fiber?.alternate?.hooks[renderState.hookIdx];

	const hook = {
		tag: STATE_HOOK,
		state: undefined,
		actionQueue: [],
	};

	if (oldHook) {
		hook.state = oldHook.state;
	} else if (initial instanceof Function) {
		// If an initialiser function is giver, obtain state from it
		hook.state = initial();
	} else {
		hook.state = initial;
	}

	// Perform all state updates while this component is being rendered
	const actionQueue = oldHook?.actionQueue ?? [];
	for (const action of actionQueue) {
		if (action instanceof Function) {
			hook.state = action(hook.state);
		} else {
			hook.state = action;
		}
	}

	function setState(updater) {
		hook.actionQueue.push(updater);
		// All state updates from one component are batched to happen during next rerender
		if (fiber.isRerenderQueued) return;
		queueTask(
			createRootFiber(
				renderState.currentRoot.dom,
				renderState.currentRoot.props,
				renderState.currentRoot,
			),
		);

		fiber.isRerenderQueued = true;
	}

	fiber.hooks.push(hook);
	++renderState.hookIdx;
	return [hook.state, setState];
}
