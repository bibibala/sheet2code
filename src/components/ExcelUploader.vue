<script setup lang="ts">
import * as XLSX from "xlsx";
import { ref } from "vue";

const emitting = defineEmits<{
    (e: "loaded", payload: { workbook: XLSX.WorkBook; fileName: string }): void;
    (e: "error", message: string): void;
}>();

const fileName = ref("");
const status = ref("请选择一个Excel文件(.xlsx,.xls或.csv)");

function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0]!;
    fileName.value = `已选择: ${file.name}`;
    status.value = "正在处理文件...";

    const reader = new FileReader();

    reader.onload = async (evt) => {
        try {
            const result = evt.target?.result;
            if (typeof result === "string") {
                const wb = XLSX.read(result, { type: "string" });
                emitting("loaded", { workbook: wb, fileName: file.name });
            } else if (result instanceof ArrayBuffer) {
                const data = new Uint8Array(result);
                const wb = XLSX.read(data, { type: "array" });
                emitting("loaded", { workbook: wb, fileName: file.name });
            } else {
                throw new Error("无法读取文件内容");
            }
            status.value = "";
        } catch (err: any) {
            status.value = `处理错误: ${err?.message || String(err)}`;
            emitting("error", status.value);
            console.error(err);
        }
    };

    reader.onerror = () => {
        status.value = "文件读取失败";
        emitting("error", status.value);
    };

    if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}
</script>

<template>
    <div>
        <label
            style="
                display: inline-block;
                background: #2563eb;
                color: #fff;
                padding: 6px 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            "
        >
            选择Excel文件
            <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style="display: none"
                @change="onFileChange"
            />
        </label>
        <p
            style="
                margin-left: 8px;
                display: inline;
                color: #6b7280;
                font-size: 12px;
            "
        >
            {{ fileName }}
        </p>
        <span style="margin-left: 8px; color: #6b7280; font-size: 12px">{{
            status
        }}</span>
    </div>
</template>

<style scoped></style>
