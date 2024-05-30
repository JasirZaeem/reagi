import { createRootFiber } from "../fiber.js";
import { renderState } from "../renderer.js";
import { queueTask } from "../scheduler.js";

export const STATE_HOOK = "useState";

function createSetState(setStateContext) {
	function setState(updater) {
		this.hook.actionQueue.push(updater);
		// All state updates from one component are batched to happen during next rerender
		if (this.fiber.isRerenderQueued) return;
		queueTask(
			createRootFiber(
				renderState.currentRoot.dom,
				renderState.currentRoot.props,
				renderState.currentRoot,
			),
		);

		this.fiber.isRerenderQueued = true;
	}

	return setState.bind(setStateContext);
}

export function useState(initial) {
	const fiber = renderState.currentFiber;
	const oldHook = fiber?.alternate?.hooks[renderState.hookIdx];

	const hook = {
		tag: STATE_HOOK,
		state: undefined,
		setStateContext: undefined,
		setState: undefined,
		actionQueue: [],
	};

	if (oldHook) {
		hook.state = oldHook.state;
		hook.setStateContext = oldHook.setStateContext;
		hook.setStateContext.hook = hook;
		hook.setStateContext.fiber = fiber;
		hook.setState = oldHook.setState;
	} else {
		if (initial instanceof Function) {
			// If an initialiser function is given, obtain state from it
			hook.state = initial();
		} else {
			hook.state = initial;
		}
		hook.setStateContext = {
			hook,
			fiber,
		};
		hook.setState = createSetState(hook.setStateContext);
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

	fiber.hooks.push(hook);
	++renderState.hookIdx;
	return [hook.state, hook.setState];
}
