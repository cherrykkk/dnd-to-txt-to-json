<template>
  <div class="page-txt-json-html">
    <textarea v-model="inputTxt" class="txt-input" placeholder="地精..."></textarea>
    <div class="html-preview">
      <div class="preview-radio-container">
        <div @click="previewRadio = 'json'">JSON</div>
        <div @click="previewRadio = 'html'">HTML</div>
      </div>
      <div v-if="!inputTxt">待输入</div>
      <MonsterCardPreview v-if="previewRadio === 'html'" :monster-card-html="outputHTML" />
      <div class="json-preview" v-else>
        {{ outputJson }}
      </div>
    </div>
    <!--    <div class="json-preview" v-if="!parseErrorState.toJson">-->
    <!--      <details class="json-preview-details">-->
    <!--        {{ outputJson }}-->
    <!--        <summary>JSON 格式</summary>-->
    <!--      </details>-->
    <!--    </div>-->
    <!--    <div class="json-error" v-else>-->
    <!--      {{ parseErrorState.toJsonMessage }}-->
    <!--    </div>-->
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { parseMonsterTxtToJson } from "../parser/monster-txt-to-json";
import { monsterJsonToHtml } from "../json-to-html";
import { MonsterCard } from "card-types";
import MonsterCardPreview from "./MonsterCardPreview.vue";

const parseErrorState = ref({
  toJson: false,
  toJsonMessage: "",
  toHtml: false,
  toHTMLMessage: "",
});

const previewRadio = ref("html");

const inputTxt = ref<string>("");

const outputJson = computed(() => {
  let output: MonsterCard | null = null;
  if (inputTxt.value) {
    parseErrorState.value.toJson = false;
    parseErrorState.value.toJsonMessage = "";
    try {
      output = parseMonsterTxtToJson(inputTxt.value);
    } catch (error) {
      console.error(error);
      parseErrorState.value.toJson = true;
      parseErrorState.value.toJsonMessage = (error as Error).message;
    }
  }
  return output;
});

const outputHTML = computed(() => {
  let output = "";
  if (outputJson.value === null) return output;
  try {
    output = monsterJsonToHtml(outputJson.value);
  } catch (error) {
    console.error(error);
    parseErrorState.value.toHtml = true;
    parseErrorState.value.toHTMLMessage = (error as Error).message;
  }
  return output;
});
</script>
<style>
.page-txt-json-html {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
}
.txt-input {
  height: calc(100% - 20px);
  width: calc(100% - 20px);
  margin: 10px;
  flex-shrink: 1;
}
.json-preview {
  white-space: pre-wrap;
}

.preview-radio-container {
  display: flex;
  justify-content: space-around;
  margin: 10px;
}
.preview-radio-container > div {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 2px;
  margin: 2px;
}
.html-preview {
  height: 100%;
  max-width: 600px;
  overflow: auto;
  flex-shrink: 0;
}
</style>
