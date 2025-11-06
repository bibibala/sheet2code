<script setup lang="ts">
const props = defineProps<{
    sheets: string[];
    modelValue?: string;
}>();

const emits = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

function onChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    emits("update:modelValue", target.value);
}
</script>

<template>
    <div v-if="props.sheets && props.sheets.length" style="margin-left: 8px">
        <select
            :value="props.modelValue"
            @change="onChange"
            style="
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 4px 6px;
                font-size: 13px;
            "
        >
            <option v-for="name in props.sheets" :key="name" :value="name">
                {{ name }}
            </option>
        </select>
    </div>
</template>

<style scoped></style>
