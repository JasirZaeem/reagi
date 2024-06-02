import { renderState } from "../renderer.js";
import { compareDependencies } from "./utils.js";

export const MEMO_HOOK = "useMemo";

export function useMemo(calculateValue, dependencies) {
	const oldHook =
		renderState.currentFiber?.alternate?.hooks[renderState.hookIdx];

	const areDependenciesSame = compareDependencies(
		oldHook?.dependencies,
		dependencies,
	);

	const hook = {
		tag: MEMO_HOOK,
		memoisedValue: areDependenciesSame
			? oldHook.memoisedValue
			: calculateValue(),
		dependencies,
	};

	renderState.currentFiber.hooks.push(hook);
	++renderState.hookIdx;

	return hook.memoisedValue;
}
