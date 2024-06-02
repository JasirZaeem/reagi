export function compareDependencies(prevDeps, nextDeps) {
	if (!prevDeps || !nextDeps) {
		// !prevDeps - Either first render, or no deps i.e. run on every render
		// !nextDep - Old component was unmounted, new component in its place
		return false;
	}

	for (let i = 0; i < prevDeps.length; ++i) {
		if (prevDeps[i] !== nextDeps[i]) {
			return false;
		}
	}

	return true;
}
