const TEXT_ELEMENT = "TEXT_ELEMENT";

class Element {
	constructor(type, props) {
		this.type = type;
		this.props = props;
	}
}

function createTextElement(text) {
	return new Element(TEXT_ELEMENT, {
		nodeValue: text,
		children: [],
	});
}

export function createElement(type, props, ...children) {
	return new Element(type, {
		...props,
		children: children
			.flat()
			.map((child) =>
				typeof child === "object" ? child : createTextElement(child),
			),
	});
}
