import { PROP_CHILDREN, TEXT_ELEMENT } from "./jsx.js";

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

export function commitRoot(rootFiber) {
	commitWork(rootFiber.child);
}

function commitWork(fiber) {
	if (!fiber) return;

	const parentDom = fiber.parent.dom;
	parentDom.appendChild(fiber.dom);

	// Traverse fiber tree
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}
