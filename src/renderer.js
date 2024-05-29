import { Fiber, createRootFiber } from "./fiber.js";
import { beginWorkLoop, queueTask } from "./scheduler.js";
import { commitRoot, createDom } from "./dom.js";
import { reconcileChildren } from "./reconciler.js";

export const renderState = {
	currentRoot: null,
	deletions: [],
};

function afterRender(rootFiber) {
	commitRoot(rootFiber, renderState.deletions);
	// The current rendered root to be reconciled against during next render
	renderState.currentRoot = rootFiber;
}

export function render(element, container) {
	queueTask(
		createRootFiber(
			container,
			{
				children: [element],
			},
			renderState.currentRoot,
		),
	);
	beginWorkLoop(renderUnit, afterRender);
}

function renderUnit(fiber) {
	fiber.dom ??= createDom(fiber);

	const childrenElements = fiber.props.children;
	reconcileChildren(fiber, childrenElements);

	if (fiber.child) {
		// Traverse to child
		return fiber.child;
	}

	let nextFiber = fiber;

	while (nextFiber) {
		if (nextFiber.sibling) {
			// Then the child's siblings
			return nextFiber.sibling;
		}

		// The back to parent and its siblings
		nextFiber = nextFiber.parent;
	}
}
