<script setup lang="ts">
import ReadPage from "@/components/ReadPage.vue";
</script>

<template>
    <header style="padding: 12px 16px; border-bottom: 1px solid #eee">
        <nav>
            <span style="color: #2c3e50; font-weight: 600">Excel 代码模板生成器</span>
        </nav>
    </header>
    <main style="padding: 16px">
        <ReadPage />
    </main>
</template>

<style scoped></style>
<style>
html,
body,
#app {
    height: 100%;
    overflow: hidden;
}

#app {
    display: flex;
    flex-direction: column;
}

main {
    flex: 1;
    overflow: hidden;
}
</style>
