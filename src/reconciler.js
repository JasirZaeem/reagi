import { Fiber } from "./fiber.js";
import { renderState } from "./renderer.js";

export const EFFECT_TAG_UPDATED = "UPDATED";
export const EFFECT_TAG_CREATED = "CREATED";
export const EFFECT_TAG_DELETED = "DELETED";

export function reconcileChildren(fiber, childrenElements) {
	let oldFiber = fiber.alternate?.child;
	let idx = 0;
	let prevSibling = null;

	while (idx < childrenElements.length || oldFiber) {
		const childElement = childrenElements[idx];
		const isTypeSame =
			oldFiber && childElement && oldFiber.type === childElement.type;

		let newFiber;

		// Changed element
		if (isTypeSame) {
			newFiber = new Fiber(
				oldFiber.type,
				childElement.props,
				oldFiber.dom,
				fiber,
				oldFiber,
				EFFECT_TAG_UPDATED,
			);
		}

		// Changed element
		if (childElement && !isTypeSame) {
			newFiber = new Fiber(
				childElement.type,
				childElement.props,
				null,
				fiber,
				null,
				EFFECT_TAG_CREATED,
			);
		}

		// Removed element
		if (oldFiber && !isTypeSame) {
			oldFiber.effectTag = EFFECT_TAG_DELETED;
			renderState.deletions.push(oldFiber);
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}

		if (idx === 0) {
			// First child element becomes child of the fiber
			fiber.child = newFiber;
		} else {
			// The rest become sibling of the previous fiber
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		++idx;
	}
}
