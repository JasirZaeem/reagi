import { PROP_CHILDREN, TEXT_ELEMENT } from "./jsx.js";
import {
	EFFECT_TAG_CREATED,
	EFFECT_TAG_DELETED,
	EFFECT_TAG_UPDATED,
} from "./reconciler.js";

/** @typedef {import("./fiber.js").Fiber} Fiber */

/**
 * Creates and updates a new dom node and adds it to provided fiber node
 * @param {Fiber} fiber
 */
export function addDom(fiber) {
	fiber.dom =
		fiber.type === TEXT_ELEMENT
			? document.createTextNode("")
			: document.createElement(fiber.type);

	updateDom(fiber);
}

/**
 * @param {Fiber} rootFiber
 * @param {Fiber[]} deletions
 */
export function commitRoot(rootFiber, deletions) {
	for (const deletedFiber of deletions) {
		commitWork(deletedFiber);
	}
	commitWork(rootFiber.child);
}

/**
 * @param {Fiber} fiber
 */
function commitWork(fiber) {
	if (!fiber) return;

	let parentDomFiber = fiber.parent;
	// Find first ancestor with a dom if parent does not have it
	while (!parentDomFiber.dom) {
		parentDomFiber = parentDomFiber.parent;
	}
	const parentDom = parentDomFiber.dom;

	if (fiber.effectTag === EFFECT_TAG_CREATED && fiber.dom) {
		parentDom.appendChild(fiber.dom);
	} else if (fiber.effectTag === EFFECT_TAG_UPDATED && fiber.dom) {
		updateDom(fiber);
	} else if (fiber.effectTag === EFFECT_TAG_DELETED) {
		commitDeletion(fiber);
		return;
	}

	// Traverse fiber tree
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

/**
 * @param {Fiber} fiber
 */
function commitDeletion(fiber) {
	if (fiber.dom) {
		fiber.dom.remove();
		fiber.dom = null;
	} else {
		commitDeletion(fiber.child);
	}
}

/**
 * @param {Fiber} fiber
 */
function updateDom(fiber) {
	const dom = fiber.dom;
	const prevProps = fiber.alternate?.props ?? {};
	const nextProps = fiber.props;

	for (const [propName, propValue] of Object.entries(prevProps)) {
		if (propName === PROP_CHILDREN) continue;

		// Remove old or changed event listeners
		if (propName.startsWith("on")) {
			if (propValue === nextProps[propName]) continue;
			const eventType = propName.substring(2).toLowerCase();
			dom.removeEventListener(eventType, propValue);
			continue;
		}

		// Remove old props
		if (propName in nextProps) continue;
		dom[propName] = "";
	}

	for (const [propName, propValue] of Object.entries(nextProps)) {
		if (propName === PROP_CHILDREN) continue;
		if (propValue === prevProps[propName]) continue;

		// Add new or updated props
		if (propName.startsWith("on")) {
			const eventType = propName.substring(2).toLowerCase();
			dom.addEventListener(eventType, propValue);
			continue;
		}

		dom[propName] = propValue;
	}
}
