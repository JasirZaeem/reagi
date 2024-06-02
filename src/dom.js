import { PROP_CHILDREN, TEXT_ELEMENT } from "./jsx.js";
import {
	EFFECT_TAG_CREATED,
	EFFECT_TAG_DELETED,
	EFFECT_TAG_UPDATED,
} from "./reconciler.js";
import { collectEffects, collectEffectsFromDeleted } from "./renderer.js";

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
		commitDeletion(deletedFiber);
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
	collectEffects(fiber);
	commitWork(fiber.sibling);
}

/**
 * @param {Fiber} fiber
 */
function commitDeletion(fiber, removeDom = true) {
	let domRemoved = false;
	if (removeDom && fiber.dom) {
		fiber.dom.remove();
		domRemoved = true;
	}
	fiber.dom = null;

	if (fiber.child) {
		// If dom is removed, don't need to remove for children,
		// otherwise let removeDom propogate unchanged
		commitDeletion(fiber.child, domRemoved ? false : removeDom);
	}
	collectEffectsFromDeleted(fiber);

	let nextSibling = fiber.sibling;
	if (nextSibling) {
		// If this fiber is being deleted, the parent must now have fewer children
		// than it did during the last render. Its siblings after this, if any,
		// should also be now removed
		// removeDom in this case will be same as it was for this fiber.
		commitDeletion(nextSibling, removeDom);
		nextSibling = nextSibling.sibling;
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
