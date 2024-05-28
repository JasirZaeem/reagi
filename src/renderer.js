import { Fiber, createRootFiber } from "./fiber.js";
import { beginWorkLoop, queueTask } from "./scheduler.js";
import { commitRoot, createDom } from "./dom.js";

export function render(element, container) {
	queueTask(
		createRootFiber(container, {
			children: [element],
		}),
	);
	beginWorkLoop(renderUnit, commitRoot);
}

function renderUnit(fiber) {
	fiber.dom ??= createDom(fiber);

	const childrenElements = fiber.props.children;
	let idx = 0;
	let prevSibling = null;

	while (idx < childrenElements.length) {
		const element = childrenElements[idx];

		const newFiber = new Fiber(element.type, element.props, null, fiber);

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
