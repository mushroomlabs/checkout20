<template>
<div id="app">
  
  <Checkout v-if="storeId" />
</div>
</template>

<script>
import settings from './settings.js'
import Checkout from '@/views/Checkout.vue'

export default {
    name: 'App',
    components: {
        Checkout
    },
    computed: {
        storeId() {
            return this.$store.state.storeId
        }
    },
    mounted() {
        this.$store.commit('setup', settings)
    }    
}
</script>

<style lang="scss">
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    li {
        list-style-type: none;
    }

    ul.token-selector {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        grid-row-gap: 5vh;
        justify-items: center;
        
        li.token-selector-item {
            border: 2px solid white;
            display: grid;
            grid-template-rows: 2em 160px 2em;
            
            justify-content: center;
            align-content: center;

            width: 240px;
            padding: 1vh 5px;
            
            &:hover {
                border: 2px solid green !important;
                cursor: pointer;
            }
            
            span.token-name {
                display: block;
                color: #444;
                font-weight: 200;
                text-align: center;
            }

            img {
                display: block;
                margin: auto;
                max-width: 100px;
                max-height: 100px;
            }

            div.token-exchange-rate {
                text-align: center;
            }
        }
    }
}
</style>
