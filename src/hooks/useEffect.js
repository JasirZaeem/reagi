import { renderState } from "../renderer.js";
import { compareDependencies } from "./utils.js";

export const EFFECT_HOOK = "useEffect";

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
	++renderState.hookIdx;
}
