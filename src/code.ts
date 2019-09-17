import { dispatch, handleEvent } from './codeMessageHandler';
figma.showUI(__html__, { height: 600, width: 300 });

let windowFocus = false;
let oldSelection = [];

const poll = () => {
	const selection = figma.currentPage.selection;
	if (selection.length === 0) dispatch('error', 'Please select a layer');
	else inspect(selection);

	if (!windowFocus) setTimeout(poll, 100);
};

function nodeToObject(node) {
	const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__));
	const blacklist = ['parent', 'children', 'removed'];
	const obj = { id: node.id, children: undefined };
	for (const [name, prop] of props) {
		if (prop.get && blacklist.indexOf(name) < 0) {
			obj[name] = prop.get.call(node);
		}
	}
	if (node.children) obj.children = node.children.map(nodeToObject);
	return obj;
}

const inspect = node => {
	const nodes = nodeToObject({ children: node }).children;
	if (JSON.stringify(oldSelection) !== JSON.stringify(nodes)) {
		dispatch('updateNode', nodes);
	}
	oldSelection = nodes;
};

poll();

handleEvent('windowFocus', focus => {
	windowFocus = focus;
	poll();
});
