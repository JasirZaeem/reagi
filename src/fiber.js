export class Fiber {
	constructor(type, props, dom, parent) {
		// Data
		this.type = type;
		this.props = props;
		this.dom = dom;

		// Fiber Tree
		this.parent = parent;
		this.child = null;
		this.sibling = null;
	}
}

export function createRootFiber(dom, props) {
	return new Fiber(null, props, dom, null);
}
