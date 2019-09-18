import { dispatch, handleEvent } from './codeMessageHandler';
figma.showUI(__html__, { height: 600, width: 300 });

let windowFocus = false;
let oldSelection = [];
let filterText = '';
let oldFilterText = '';

const poll = () => {
	const selection = figma.currentPage.selection;
	if (selection.length === 0) {
		oldSelection = [];
		dispatch('error', 'Please select one or more layers');
	} else inspect(selection);

	if (!windowFocus) setTimeout(poll, 100);
};

const nodeToObject = node => {
	const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__));
	const blacklist = ['parent', 'children', 'removed'];
	let obj: any = { id: node.id, children: undefined };
	for (const [name, prop] of props) {
		if (prop.get && blacklist.indexOf(name) < 0) {
			obj[name] = prop.get.call(node);
			if (typeof obj[name] === 'symbol') obj[name] = 'Mixed';
		}
	}
	if (filterText.trim() !== '') {
		const filteredProperties = Object.keys(obj).filter(key => key.includes(filterText));
		const newObj = {};
		filteredProperties.forEach(property => {
			newObj[property] = obj[property];
		});
		obj = newObj;
	}
	if (node.children) obj.children = node.children.map(nodeToObject);

	return obj;
};

const inspect = node => {
	const nodes = nodeToObject({ children: node }).children;
	if (JSON.stringify(oldSelection) !== JSON.stringify(nodes) || oldFilterText !== filterText) {
		dispatch('updateNode', nodes);
	}
	oldSelection = nodes;
	oldFilterText = filterText;
};

poll();

handleEvent('windowFocus', focus => {
	windowFocus = focus;
	poll();
});

handleEvent('updateFilterText', newfilterText => {
	filterText = newfilterText;
	poll();
});
