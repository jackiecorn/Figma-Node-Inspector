<template lang="pug">
div
	div(style='padding-left:4px')
		.input-icon
			.input-icon__icon
				.icon.icon--search.icon--black-3
		input.input-icon__input(type="input" placeholder='Search property' v-model='filterText' @keydown='inputKeydown')
	json-viewer(v-show='error === ""' :value='json' :expand-depth='2' :copyable="{copyText: 'Copy', copiedText: 'Copied'}" theme="json-theme")
	.error.type.type--pos-medium-normal(v-show='error !== ""') {{error}}
</template>

<script>
import { dispatch, handleEvent } from "./uiMessageHandler";
import JsonViewer from "vue-json-viewer";

export default {
  components: { JsonViewer },
  data() {
    return {
      json: {},
      filterText: "",
      error: ""
    };
  },
  watch: {
    filterText(val) {
      dispatch("updateFilterText", val);
    }
  },
  mounted() {
    handleEvent("updateNode", json => {
      this.error = "";
      this.json = json;
    });
    handleEvent("error", message => {
      this.error = message;
    });
    window.onfocus = () => dispatch("windowFocus", true);
    window.onblur = () => dispatch("windowFocus", false);
  },
  methods: {
    inputKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        e.target.select();
      }
    }
  }
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";
body {
  margin: 0;
}

span {
  cursor: default;
}

.jv-container .jv-code {
  overflow: auto;
  padding: 16px;
  padding-top: 8px;
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
  height: 600px;
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