<script setup lang="ts">
import { computed } from "vue";
import type {
  CodeBlockNode,
  HeadingNode,
  MarkdownNode,
} from "../types/markdown-ast";

defineOptions({ name: "MarkdownRenderer" });

const props = withDefaults(
  defineProps<{
    nodes?: MarkdownNode[];
  }>(),
  {
    nodes: () => [],
  },
);

const safeNodes = computed(() => props.nodes ?? []);

function headingTag(level: HeadingNode["level"]): string {
  return `h${level}`;
}

function languageClass(
  language: CodeBlockNode["language"],
): string | undefined {
  if (!language) {
    return undefined;
  }

  return `language-${language}`;
}

function codeBlockAriaLabel(
  language: CodeBlockNode["language"],
): string | undefined {
  if (!language) {
    return undefined;
  }

  const display = language.charAt(0).toUpperCase() + language.slice(1);
  return `${display} code block`;
}
</script>

<template>
  <template v-for="(node, index) in safeNodes" :key="`${node.type}-${index}`">
    <template v-if="node.type === 'text'">{{ node.content }}</template>

    <br v-else-if="node.type === 'lineBreak'" />
    <code v-else-if="node.type === 'inlineCode'">{{ node.content }}</code>

    <strong v-else-if="node.type === 'bold'">
      <MarkdownRenderer :nodes="node.children" />
    </strong>

    <em v-else-if="node.type === 'italic'">
      <MarkdownRenderer :nodes="node.children" />
    </em>

    <component :is="headingTag(node.level)" v-else-if="node.type === 'heading'">
      <MarkdownRenderer :nodes="node.children" />
    </component>

    <p v-else-if="node.type === 'paragraph'">
      <MarkdownRenderer :nodes="node.children" />
    </p>

    <ul v-else-if="node.type === 'unorderedList'">
      <li
        v-for="(item, itemIndex) in node.children"
        :key="`ul-item-${itemIndex}`"
      >
        <MarkdownRenderer :nodes="item.children" />
      </li>
    </ul>

    <ol v-else-if="node.type === 'orderedList'" :start="node.start">
      <li
        v-for="(item, itemIndex) in node.children"
        :key="`ol-item-${itemIndex}`"
      >
        <MarkdownRenderer :nodes="item.children" />
      </li>
    </ol>

    <pre
      v-else-if="node.type === 'codeBlock'"
    ><code :class="languageClass(node.language)" :aria-label="codeBlockAriaLabel(node.language)">{{
      node.content
    }}</code></pre>
  </template>
</template>
