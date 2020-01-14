<template>
<span class="spinner">{{ message }}</span>    
</template>


<script>
export default {
    name: 'Spinner',
    props: {
        message: String
    }
}
</script>
