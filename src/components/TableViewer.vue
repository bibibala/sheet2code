<script setup lang="ts">
import * as XLSX from "xlsx";
import { computed, watch, ref, nextTick, onMounted, onUnmounted } from "vue";

const props = defineProps<{
    worksheet?: XLSX.WorkSheet | null;
}>();

const emits = defineEmits<{
    (e: "renderedHtml", html: string): void;
}>();

function sanitizeTableHtml(html: string): string {
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    let table = tpl.content.querySelector("table");
    // 若未找到 table，尝试 DOMParser 解析
    if (!table) {
        try {
            const doc = new DOMParser().parseFromString(html, "text/html");
            table = doc.querySelector("table") as HTMLTableElement | null;
        } catch (_) {
            table = null;
        }
    }

    if (table) {
        const all = table.querySelectorAll("*");
        all.forEach((el) => {
            // 仅保留必要结构属性，移除其他所有属性（避免产生无效属性名/值）
            const allow = new Set(["rowspan", "colspan"]);
            Array.from(el.attributes).forEach((attr) => {
                if (!allow.has(attr.name.toLowerCase())) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        return (table as HTMLElement).outerHTML;
    }

    return (
        html
            // 移除常见冗余属性（支持单双引号或无引号值）
            .replace(
                /\s(id|class|data-t|data-v)=(("[^"]*")|('[^']*')|[^\s>]+)/g,
                "",
            )
            // 移除可能残留的无名空属性或异常拼接（例如 "="" 或 "" 或 =""）
            .replace(/\s"=?""/g, "")
            .replace(/=\"\"/g, "")
            .replace(/\s""/g, "")
            // 压缩多余空白
            .replace(/\s{2,}/g, " ")
    );
}

const tableHtml = computed(() => {
    if (!props.worksheet) return "";
    const raw = XLSX.utils.sheet_to_html(props.worksheet, {
        editable: false,
    });
    return sanitizeTableHtml(raw);
});

const containerRef = ref<HTMLDivElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);
let ro: ResizeObserver | null = null;

const containerHeight = ref<number | null>(null);

async function updateHeight() {
    await nextTick();
    const c = containerRef.value;
    const el = contentRef.value;
    if (!c || !el) return;
    const parent = c.parentElement;
    const parentHeight = parent?.clientHeight ?? c.clientHeight;
    const contentHeight = el.scrollHeight;
    containerHeight.value = Math.min(contentHeight, parentHeight);
}

watch(
    tableHtml,
    async (html) => {
        if (html) emits("renderedHtml", html);
        await updateHeight();
    },
    { immediate: true },
);

onMounted(() => {
    ro = new ResizeObserver(() => updateHeight());
    const target = containerRef.value?.parentElement ?? containerRef.value;
    if (target && ro) ro.observe(target);
});

onUnmounted(() => {
    const target = containerRef.value?.parentElement ?? containerRef.value;
    if (ro && target) ro.unobserve(target);
});
</script>

<template>
    <div v-if="tableHtml" ref="containerRef">
        <div ref="contentRef" v-html="tableHtml"></div>
    </div>
</template>

<style scoped>
:deep(table) {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
}

:deep(td),
:deep(th) {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
    white-space: normal;
}

:deep(tbody tr:nth-child(-n + 2) td) {
    font-weight: 600;
}

:deep(tr:hover) {
    background-color: #f9f9f9;
}
</style>
