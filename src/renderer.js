import { createRootFiber } from "./fiber.js";
import { beginWorkLoop, queueTask } from "./scheduler.js";
import { commitRoot, addDom } from "./dom.js";
import { reconcileChildren } from "./reconciler.js";
import { Fragment } from "./jsx.js";

/** @typedef {import("./fiber.js").Fiber} Fiber */

/**
 * @typedef {object} RenderState
 * @property {Fiber | null} currentRoot
 * @property {Fiber[]} deletions
 * @property {Fiber} currentFiber
 * @property {hookIdx} number
 */
/** @type {RenderState} */
export const renderState = {
	currentRoot: null,
	deletions: [],
	currentFiber: null,
	hookIdx: 0,
};

/**
 * @param {Fiber} rootFiber
 */
function afterRender(rootFiber) {
	commitRoot(rootFiber, renderState.deletions);
	// The current rendered root to be reconciled against during next render
	renderState.currentRoot = rootFiber;
	renderState.deletions = [];
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
	// Set fiber being rendered currently
	renderState.currentFiber = fiber;
	renderState.hookIdx = 0;

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
	const children =
		fiber.type === Fragment
			? fiber.type(fiber.props)
			: [fiber.type(fiber.props)];
	reconcileChildren(fiber, children);
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
