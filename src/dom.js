import { PROP_CHILDREN, TEXT_ELEMENT } from "./jsx.js";

export function render(element, container) {
	const dom =
		element.type === TEXT_ELEMENT
			? document.createTextNode("")
			: document.createElement(element.type);

	for (const [propName, propValue] of Object.entries(element.props)) {
		if (propName === PROP_CHILDREN) continue;
		dom[propName] = propValue;
	}

	for (const child of element.props.children) {
		render(child, dom);
	}

	container.appendChild(dom);
}
