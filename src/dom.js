import { PROP_CHILDREN, TEXT_ELEMENT } from "./jsx.js";
import {
	EFFECT_TAG_CREATED,
	EFFECT_TAG_DELETED,
	EFFECT_TAG_UPDATED,
} from "./reconciler.js";

/** @typedef {import("./fiber.js").Fiber} Fiber */

/**
 * @param {Fiber} fiber
 */
export function createDom(fiber) {
	const dom =
		fiber.type === TEXT_ELEMENT
			? document.createTextNode("")
			: document.createElement(fiber.type);

	for (const [propName, propValue] of Object.entries(fiber.props)) {
		if (propName === PROP_CHILDREN) continue;
		dom[propName] = propValue;
	}

	return dom;
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

	const parentDom = fiber.parent.dom;
	if (fiber.effectTag === EFFECT_TAG_CREATED && fiber.dom) {
		parentDom.appendChild(fiber.dom);
	} else if (fiber.effectTag === EFFECT_TAG_UPDATED && fiber.dom) {
		updateDom();
	} else if (fiber.effectTag === EFFECT_TAG_DELETED) {
		fiber.dom.remove();
		return;
	}

	// Traverse fiber tree
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function updateDom() {
	//TODO
}
