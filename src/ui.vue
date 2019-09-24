<template lang="pug">
#app
	#tabs.type.type--pos-small-normal
		.tab(:class="{active: mode === 'node'}" @click="mode = 'node'") Node
		.tab(:class="{active: mode === 'component'}" @click="mode = 'component'") Component
		.tab(:class="{active: mode === 'style'}" @click="mode = 'style'") Style
	.content.node(v-show="mode === 'node'")
		.selector(v-show='showNodeSelector')
			.label Node ID
			input.input#nodeId(type="input" placeholder='Enter one or more node ID\'s, separated by comma' v-model='nodeId' @keydown='inputKeydown')
			button.button.button--primary(:disabled='nodeId === ""' @click='selectNodes') Select Nodes
		.header
			.search
				.input-icon
					.input-icon__icon
						.icon.icon--search.icon--black-3
				input.input-icon__input(type="input" placeholder='Search' v-model='nodeFilterText' @keydown='inputKeydown')
			.icon.icon--select.icon--button(@click='showNodeSelector = !showNodeSelector' :class='{"icon--selected": showNodeSelector}')
		json-viewer(v-show='error === ""' :value='nodeJson' :expand-depth='2' :copyable="{copyText: 'Copy', copiedText: 'Copied'}" theme="json-theme")
		.error.type.type--pos-medium-normal(v-show='error !== ""') {{error}}
	.content.component(v-show="mode === 'component'")
		.selector(v-show='showComponentSelector')
			.label Component key
			input.input#componentKey(type="input" placeholder='Enter one or more keys, separated by comma' v-model='componentKey' @keydown='inputKeydown')
			button.button.button--primary(:disabled='componentKey === ""' @click='inspectComponents') Inspect Components
		.header(v-show='JSON.stringify(componentJson) !== JSON.stringify({})')
			.search
				.input-icon
					.input-icon__icon
						.icon.icon--search.icon--black-3
				input.input-icon__input(type="input" placeholder='Search' v-model='componentFilterText' @keydown='inputKeydown')
			.icon.icon--select.icon--button(@click='showComponentSelector = !showComponentSelector' :class='{"icon--selected": showComponentSelector}')
		json-viewer(v-show='JSON.stringify(componentJson) !== JSON.stringify({})' :value='componentJson' :expand-depth='2' :copyable="{copyText: 'Copy', copiedText: 'Copied'}" theme="json-theme")
	.content.style(v-show="mode === 'style'")
		.selector(v-show='showStyleSelector')
			select.select-menu#styleSelectorType(v-model='styleSelectorType' @change='updateStyleSelectorType')
				option(value="id") Select by Style ID
				option(value="key") Select by Style Key (Shared Styles)
				option(value="local") All Local Styles
			.selector-id(v-show="styleSelectorType === 'id'")
				.label Style ID
				input.input#styleId(type="input" placeholder='Enter one or more ID\'s, separated by semicolon ;' v-model='styleId' @keydown='inputKeydown')
				button.button.button--primary(:disabled='styleId === ""' @click='inspectStylesById') Inspect Styles
			.selector-key(v-show="styleSelectorType === 'key'")
				.label Style Key
				input.input#styleKey(type="input" placeholder='Enter one or more keys, separated by semicolon ;' v-model='styleKey' @keydown='inputKeydown')
				button.button.button--primary(:disabled='styleKey === ""' @click='inspectStylesByKey') Inspect Styles
		.header(v-show='JSON.stringify(styleJson) !== JSON.stringify({})')
			.search
				.input-icon
					.input-icon__icon
						.icon.icon--search.icon--black-3
				input.input-icon__input(type="input" placeholder='Search' v-model='styleFilterText' @keydown='inputKeydown')
			.icon.icon--select.icon--button(@click='showStyleSelector = !showStyleSelector' :class='{"icon--selected": showStyleSelector}')
		json-viewer(v-show='JSON.stringify(styleJson) !== JSON.stringify({}) || styleSelectorType === "local"' :value='styleJson' :expand-depth='2' :copyable="{copyText: 'Copy', copiedText: 'Copied'}" theme="json-theme")
</template>

<script>
import "./figma-ui/js/selectMenu.js";
import { dispatch, handleEvent } from "./uiMessageHandler";
import JsonViewer from "vue-json-viewer";

export default {
  components: { JsonViewer },
  data() {
    return {
      mode: "node",
      showNodeSelector: false,
      showComponentSelector: true,
      showStyleSelector: true,
      styleSelectorType: "id",
      nodeJson: {},
      componentJson: {},
      styleJson: {},
      nodeFilterText: "",
      componentFilterText: "",
      styleFilterText: "",
      error: "",
      nodeId: "",
      componentKey: "",
      styleId: "",
      styleKey: ""
    };
  },
  watch: {
    styleSelectorType(val) {
      if (val === "local") {
        dispatch("inspectAllLocalStyles");
      } else this.styleJson = {};
    },
    nodeFilterText(val) {
      dispatch("updateNodeFilterText", val);
    },
    componentFilterText(val) {
      dispatch("updateComponentText", val);
    },
    styleFilterText(val) {
      dispatch("updateStyleText", val);
    },
    componentJson(json) {
      if (JSON.stringify(json) !== JSON.stringify({}))
        this.showComponentSelector = false;
    },
    styleJson(json) {
      if (
        JSON.stringify(json) !== JSON.stringify({}) &&
        this.styleSelectorType !== "local"
      )
        this.showStyleSelector = false;
    }
  },
  mounted() {
    window.selectMenu.init();
    handleEvent("updateNode", json => {
      this.error = "";
      this.nodeJson = json;
    });
    handleEvent("updateComponentJson", json => {
      this.componentJson = json;
    });
    handleEvent("updateStyleJson", json => {
      this.styleJson = json;
    });
    handleEvent("error", message => {
      this.error = message;
    });
    window.onfocus = () => dispatch("windowFocus", true);
    window.onblur = () => dispatch("windowFocus", false);
  },
  methods: {
    updateStyleSelectorType(e) {
      // console.log(e.target.value);
      // console.log(this.styleSelectorType);
    },
    inputKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        e.target.select();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.target.id === "nodeId") this.selectNodes();
        if (e.target.id === "componentKey") this.inspectComponents();
        if (e.target.id === "styleId") this.inspectStylesById();
        if (e.target.id === "styleKey") this.inspectStylesByKey();
      }
    },
    selectNodes() {
      dispatch("selectNode", this.nodeId.split(","));
      this.showNodeSelector = false;
    },
    inspectComponents() {
      dispatch("inspectComponents", this.componentKey.split(","));
    },
    inspectStylesById() {
      dispatch("inspectStylesById", this.styleId.split(";"));
    },
    inspectStylesByKey() {
      dispatch("inspectStylesByKey", this.styleKey.split(";"));
    }
  }
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";
.icon--select {
  background-image: url("data:image/svg+xml,%3Csvg width='32' height='128' viewBox='0 0 32 128' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.216 15.872L22.112 16.416L21.104 16.688L16.464 17.936L13.76 22.016L13.184 22.912L12.96 21.872L10.576 10.304L10.368 9.312L11.248 9.84L21.216 15.872Z' fill='black' fill-opacity='0.8'/%3E%3Cpath d='M21.216 47.872L22.112 48.416L21.104 48.688L16.464 49.936L13.76 54.016L13.184 54.912L12.96 53.872L10.576 42.304L10.368 41.312L11.248 41.84L21.216 47.872Z' fill='black' fill-opacity='0.3'/%3E%3Cpath d='M21.216 79.872L22.112 80.416L21.104 80.688L16.464 81.936L13.76 86.016L13.184 86.912L12.96 85.872L10.576 74.304L10.368 73.312L11.248 73.84L21.216 79.872Z' fill='%2318A0FB' fill-opacity='0.8'/%3E%3Cpath d='M21.216 111.872L22.112 112.416L21.104 112.688L16.464 113.936L13.76 118.016L13.184 118.912L12.96 117.872L10.576 106.304L10.368 105.312L11.248 105.84L21.216 111.872Z' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E%0A");
}

body {
  margin: 0;
}

span {
  cursor: default;
}

#tabs {
  user-select: none;
  cursor: default;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;
  height: 40px;
  line-height: 40px;
  padding: 0 8px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  position: fixed;
  z-index: 999;
  width: 100%;
  margin-top: -41px;
}

.tab {
  text-transform: capitalize;
  color: #aaa;
  font-weight: 500;
  font-size: 11px;
  padding: 0 8px;
  &:hover {
    color: #333;
  }
  &.active {
    color: #333;
    font-weight: 600;
  }
}

.content {
  margin-top: 40px;
}

.selector {
  padding: 8px;
  .button {
    margin: 8px;
  }
  border-bottom: 1px solid #e5e5e5;
}

.header {
  padding: 4px;
  display: flex;
  .search {
    width: 260px;
  }
}

.jv-container .jv-code {
  overflow: auto;
  padding: 16px;
  padding-top: 8px;
}

.jv-container .jv-button {
  z-index: 1;
}

.jv-container .jv-tooltip {
  top: 4px;
}

.json-theme {
  background: #fff;
  white-space: nowrap;
  color: #525252;
  font-size: 12px;
  font-family: Inter, san-serif;

  .jv-ellipsis {
    color: #999;
    background-color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button {
    color: #49b3ff;
  }
  .jv-node {
    margin-bottom: 2px;
  }
  .jv-key {
    color: #111111;
    margin-right: 6px;
  }
  .jv-item {
    &.jv-array {
      color: #111111;
    }
    &.jv-boolean {
      color: #fc1e70;
    }
    &.jv-function {
      color: #18a0fb;
    }
    &.jv-number {
      color: #18a0fb;
    }
    &.jv-object {
      color: #111111;
    }
    &.jv-undefined {
      color: #f24822;
    }
    &.jv-string {
      color: #19b372;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}

.error {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  text-align: center;
  height: 569px;
  padding: 0 32px;
}

.input-icon__input:not(:disabled):not(:hover):placeholder-shown {
  background: none;
}

.input-icon__input:not(:disabled):focus:placeholder-shown,
.input-icon__input:hover,
.input-icon__input:active,
.input-icon__input:focus {
  border: 2px solid transparent;
}

.input-icon__input:hover {
  color: rgba(0, 0, 0, 0.8);
  border: 1px solid transparent;
}
</style>