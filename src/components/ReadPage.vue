<script setup lang="ts">
import type { WorkBook, WorkSheet } from "xlsx";
import { ref, computed } from "vue";
import ExcelUploader from "@/components/ExcelUploader.vue";
import SheetSelector from "@/components/SheetSelector.vue";
import TableViewer from "@/components/TableViewer.vue";
import CodeHighlighter from "@/components/CodeHighlighter.vue";

const workbook = ref<WorkBook | null>(null);
const fileName = ref("");
const sheets = ref<string[]>([]);
const selectedSheet = ref<string>("");
const tableSource = ref<string>("");
const showCode = ref(false);
const activeLang = ref<"html" | "vue">("html");

function openCodeModal(lang: "html" | "vue") {
    activeLang.value = lang;
    showCode.value = true;
}

function onLoaded(payload: { workbook: WorkBook; fileName: string }) {
    workbook.value = payload.workbook;
    fileName.value = payload.fileName;
    sheets.value = payload.workbook.SheetNames;
    selectedSheet.value = sheets.value[0] || "";
}

const currentWorksheet = computed<WorkSheet | null>(() => {
    if (!workbook.value || !selectedSheet.value) return null;
    return workbook.value.Sheets[selectedSheet.value] as WorkSheet;
});

function onRenderedHtml(html: string) {
    tableSource.value = html;
}

function extractTable(html: string): string {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const table = doc.querySelector("table");
        if (table) return table.outerHTML;
    } catch (e) {
        // 解析失败则走正则兜底
    }
    const match = html.match(/<table[\s\S]*?<\/table>/i);
    return match ? match[0] : html;
}

function buildStandaloneHtml(tableHtml: string): string {
    const safeTable = extractTable(tableHtml);
    const style = `
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px 12px; text-align: center; vertical-align: middle; }
    tbody tr:nth-child(-n+2) td { font-weight: 600; }
    tr:hover { background-color: #f9f9f9; }
  `;
    const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Excel 表格预览</title>
  <style>${style}</style>
</head>
<body>
${safeTable}
</body>
</html>`;
    return doc;
}

const fullHtmlDoc = computed(() =>
    tableSource.value ? buildStandaloneHtml(tableSource.value) : "",
);

function buildVueSfc(tableHtml: string): string {
    const safeTable = extractTable(tableHtml);
    const style = `
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px 12px; text-align: center; vertical-align: middle; }
    tbody tr:nth-child(-n+2) td { font-weight: 600; }
    tr:hover { background-color: #f9f9f9; }
  `;
    const openScript = "<" + "script setup>";
    const closeScript = "<" + "/script>";
    const openStyle = "<" + "style>";
    const closeStyle = "<" + "/style>";
    return `<template>
  <div class=\"excel-preview\">\n${safeTable}\n  </div>
</template>

${openStyle}
${style}
${closeStyle}`;
}

const vueCode = computed(() =>
    tableSource.value ? buildVueSfc(tableSource.value) : "",
);

async function copyFullHtml() {
    try {
        await navigator.clipboard.writeText(fullHtmlDoc.value);
        alert("已复制到剪贴板");
    } catch (e) {
        console.error(e);
    }
}
</script>

<template>
    <section class="page">
        <div class="toolbar">
            <div class="left">
                <ExcelUploader @loaded="onLoaded" />
                <span v-if="workbook" class="file">{{ fileName }}</span>
                <SheetSelector
                    v-if="workbook"
                    v-model="selectedSheet"
                    :sheets="sheets"
                />
            </div>
            <div class="right">
                <button
                    class="btn"
                    :disabled="!fullHtmlDoc"
                    @click="copyFullHtml"
                >
                    复制完整HTML
                </button>
                <button
                    class="btn secondary"
                    :disabled="!tableSource"
                    @click="openCodeModal('html')"
                >
                    查看代码
                </button>
            </div>
        </div>

        <div class="viewer">
            <TableViewer
                :worksheet="currentWorksheet"
                @renderedHtml="onRenderedHtml"
            />
        </div>

        <!-- 代码弹窗 -->
        <div
            v-if="showCode"
            class="modal-overlay"
            @click.self="showCode = false"
        >
            <div class="modal">
                <div class="modal-header">
                    <div class="tabs">
                        <button
                            class="tab"
                            :class="{ active: activeLang === 'html' }"
                            @click="activeLang = 'html'"
                        >
                            HTML
                        </button>
                        <button
                            class="tab"
                            :class="{ active: activeLang === 'vue' }"
                            @click="activeLang = 'vue'"
                        >
                            Vue
                        </button>
                    </div>
                    <button class="close-btn" @click="showCode = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <CodeHighlighter
                        :code="activeLang === 'html' ? fullHtmlDoc : vueCode"
                        :language="activeLang"
                        theme="vitesse-dark"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #fafafa;
}

.left {
    display: flex;
    gap: 8px;
    align-items: center;
}

.right {
    display: flex;
    gap: 8px;
    align-items: center;
}

.file {
    color: #6b7280;
    font-size: 12px;
}

.btn {
    background: #0ea5e9;
    color: #fff;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
}

.btn.secondary {
    background: #10b981;
}

.btn:disabled {
    background: #93c5fd;
    cursor: not-allowed;
}

.viewer {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 12px;
    flex: 1;
    /* 允许在列式 flex 布局中正确产生滚动 */
    min-height: 0;
    overflow: auto;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    width: min(900px, 92vw);
    max-height: 80vh;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
}

.tabs {
    display: flex;
    gap: 8px;
}

.tab {
    border: 1px solid #ddd;
    background: #f8f8f8;
    color: #374151;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
}

.tab.active {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
}

.close-btn {
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    color: #6b7280;
}

.modal-body {
    padding: 12px;
    overflow: auto;
}
</style>
