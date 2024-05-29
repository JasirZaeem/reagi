import { createRootFiber } from "./fiber.js";
import { beginWorkLoop, queueTask } from "./scheduler.js";
import { commitRoot, addDom } from "./dom.js";
import { reconcileChildren } from "./reconciler.js";

/** @typedef {import("./fiber.js").Fiber} Fiber */

/**
 * @typedef {object} RenderState
 * @property {Fiber | null} currentRoot
 * @property {Fiber[]} deletions
 */
/** @type {RenderState} */
export const renderState = {
	currentRoot: null,
	deletions: [],
};

/**
 * @param {Fiber} rootFiber
 */
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

/**
 * @param {Fiber} fiber
 */
function renderUnit(fiber) {
	const isFunctionComponent = fiber.type instanceof Function;

	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

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

/**
 * @param {Fiber} fiber
 */
function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children)
}

/**
 * @param {Fiber} fiber
 */
function updateHostComponent(fiber) {
	if (!fiber.dom) {
		addDom(fiber);
	}

	const childrenElements = fiber.props.children;
	reconcileChildren(fiber, childrenElements);
}
