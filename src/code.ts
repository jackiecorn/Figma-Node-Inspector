import { dispatch, handleEvent } from './codeMessageHandler';
figma.showUI(__html__, { height: 640, width: 300 });

let windowFocus = false;
let oldSelection = [];
let selectedComponents = [];
let selectedStyles = [];
let nodeFilterText = '';
let oldNodeFilterText = '';
let componentFilterText = '';
let styleFilterText = '';

const poll = () => {
	const selection = figma.currentPage.selection;
	if (selection.length === 0) {
		oldSelection = [];
		dispatch('error', 'Please select one or more layers');
	} else inspectNodes(selection);

	if (!windowFocus) setTimeout(poll, 100);
};

const nodeToObject = (node, filterText) => {
	const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__));
	const blacklist = ['parent', 'children', 'removed'];
	let obj: any = { id: node.id, children: undefined };
	if (node.parent) obj.parent = { id: node.parent.id };
	for (const [name, prop] of props) {
		if (prop.get && blacklist.indexOf(name) < 0) {
			obj[name] = prop.get.call(node);
			if (typeof obj[name] === 'symbol') obj[name] = 'Mixed';
		}
	}
	if (filterText.trim() !== '') {
		const filteredProperties = Object.entries(obj)
			.filter(
				entry =>
					entry[0].toLowerCase().includes(filterText.toLowerCase()) ||
					String(entry[1])
						.toLowerCase()
						.includes(filterText.toLowerCase())
			)
			.map(entry => entry[0]);
		const newObj = filteredProperties.length > 0 ? { id: obj.id, name: obj.name } : {};
		filteredProperties.forEach(property => {
			newObj[property] = obj[property];
		});
		obj = newObj;
	}
	if (node.children) obj.children = node.children.map(child => nodeToObject(child, filterText));
	if (node.masterComponent) obj.masterComponent = nodeToObject(node.masterComponent, filterText);
	return obj;
};

const inspectNodes = node => {
	const nodes = nodeToObject({ children: node }, nodeFilterText).children;
	if (JSON.stringify(oldSelection) !== JSON.stringify(nodes) || oldNodeFilterText !== nodeFilterText) {
		dispatch('updateNode', nodes);
	}
	oldSelection = nodes;
	oldNodeFilterText = nodeFilterText;
};

const inspectComponents = components => {
	dispatch('updateComponentJson', nodeToObject({ children: selectedComponents }, componentFilterText).children);
};

const inspectStyles = styles => {
	dispatch('updateStyleJson', nodeToObject({ children: selectedStyles }, styleFilterText).children);
};

const getPageNode = node => {
	if (node.type !== 'PAGE') return getPageNode(node.parent);
	else return node;
};

poll();

handleEvent('windowFocus', focus => {
	windowFocus = focus;
	poll();
});

handleEvent('updateNodeFilterText', newfilterText => {
	nodeFilterText = newfilterText;
	poll();
});

handleEvent('selectNode', nodeIds => {
	const nodes = nodeIds
		.filter(nodeId => nodeId !== '')
		.map(nodeId => figma.getNodeById(nodeId.trim().replace(/['"]+/g, '')));
	if (getPageNode(nodes[0]) !== figma.currentPage) figma.currentPage = getPageNode(nodes[0]);
	figma.currentPage.selection = nodes;
	poll();
});

handleEvent('inspectComponents', componentKeys => {
	Promise.all(
		componentKeys
			.filter(key => key !== '')
			.map(key => figma.importComponentByKeyAsync(key.trim().replace(/['"]+/g, '')))
	).then(components => {
		selectedComponents = components;
		inspectComponents(selectedComponents);
	});
});

handleEvent('updateComponentText', newfilterText => {
	componentFilterText = newfilterText;
	inspectComponents(selectedComponents);
});

handleEvent('inspectStylesById', styleIds => {
	const styles = styleIds.filter(id => id !== '').map(id => figma.getStyleById(id.trim().replace(/['"]+/g, '')));
	selectedStyles = styles;
	inspectStyles(selectedStyles);
});

handleEvent('inspectStylesByKey', styleKeys => {
	Promise.all(
		styleKeys.filter(key => key !== '').map(key => figma.importStyleByKeyAsync(key.trim().replace(/['"]+/g, '')))
	).then(styles => {
		selectedStyles = styles;
		inspectStyles(selectedStyles);
	});
});

handleEvent('inspectAllLocalStyles', () => {
	let styles = [
		...figma.getLocalPaintStyles(),
		...figma.getLocalTextStyles(),
		...figma.getLocalEffectStyles(),
		...figma.getLocalGridStyles()
	];
	selectedStyles = styles;
	inspectStyles(selectedStyles);
});

handleEvent('updateStyleText', newfilterText => {
	styleFilterText = newfilterText;
	inspectStyles(selectedStyles);
});
