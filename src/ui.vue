<template lang="pug">
div
	json-viewer(:value='json' :expand-depth='2' copyable theme="json-theme")
</template>

<script>
import { dispatch, handleEvent } from "./uiMessageHandler";
import JsonViewer from "vue-json-viewer";

export default {
  components: { JsonViewer },
  data() {
    return {
      json: {}
    };
  },
  mounted() {
    handleEvent("updateNode", json => {
      this.json = json;
    });
    window.onfocus = () => dispatch("windowFocus", true);
    window.onblur = () => dispatch("windowFocus", false);
  }
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";
body {
  margin: 0;
}
.jv-container .jv-code {
  overflow: auto;
  padding: 16px;
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
      color: #fc1e70;
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
</style>