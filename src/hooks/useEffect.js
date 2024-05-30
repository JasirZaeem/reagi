import { renderState } from "../renderer.js";

export const EFFECT_HOOK = "useEffect";

function compareDependencies(prevDeps, nextDeps) {
	if (!prevDeps) {
		// Either first render, or no deps i.e. run on every render
		return false;
	}

	for (let i = 0; i < prevDeps.length; ++i) {
		if (prevDeps[i] !== nextDeps[i]) {
			return false;
		}
	}

	return true;
}

export function useEffect(setup, dependencies) {
	const oldHook =
		renderState.currentFiber?.alternate?.hooks[renderState.hookIdx];

	const areDependenciesSame = compareDependencies(
		oldHook?.dependencies,
		dependencies,
	);

	const hook = {
		tag: EFFECT_HOOK,
		cancel: oldHook?.cancel,
		effect: setup,
		dependencies,
	};

	if (!areDependenciesSame) {
		renderState.currentFiber.queuedEffects.push(hook);
	}

	renderState.currentFiber.hooks.push(hook);
	++renderState.hookIndex;
}
