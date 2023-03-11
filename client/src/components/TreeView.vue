<template>
    <fieldset>
        <li>Table of Contents</li>
        <li>What is web development?</li>
        <li>
            CSS
            <ul>
            <li>Selectors</li>
            <li>Specificity</li>
            <li>Properties</li>
            </ul>
        </li>
        <li>
            <details open>
            <summary>JavaScript</summary>
            <ul>
                <li>Avoid at all costs</li>
                <li>
                <details>
                    <summary>Unless</summary>
                    <ul>
                    <li>Avoid</li>
                    <li>
                        <details>
                        <summary>At</summary>
                        <ul>
                            <li>Avoid</li>
                            <li>At</li>
                            <li>All</li>
                            <li>Cost</li>
                        </ul>
                        </details>
                    </li>
                    <li>All</li>
                    <li>Cost</li>
                    </ul>
                </details>
                </li>
            </ul>
            </details>
        </li>
        <li>HTML</li>
        <li>Special Thanks</li>
    </fieldset>
</template>

<script>
export default {
  name: 'TreeView',
  props: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li {
  list-style-type: none;
}
</style>
