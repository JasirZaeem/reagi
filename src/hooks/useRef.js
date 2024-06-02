import { renderState } from "../renderer.js";

export const REF_HOOK = "useRef";

export function useRef(initialValue) {
	const oldHook =
		renderState.currentFiber?.alternate?.hooks[renderState.hookIdx];

	const hook = {
		tag: REF_HOOK,
		ref: oldHook ? oldHook.ref : { current: initialValue },
	};

	renderState.currentFiber.hooks.push(hook);
	++renderState.hookIdx;

	return hook.ref;
}
