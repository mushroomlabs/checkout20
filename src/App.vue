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

    div.payment-tracker {
        h1 {
            text-align: center;
        }

        div.payment-order-details {
            display: inline-grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            width: 100%;
            background-color: #f3f7ed;
            min-height: 10vh;
            align-content: center;

            & > div {
                display: inline-block;
                padding: 1em;
                &:first-child {
                    text-align: left;
                }

                &:last-child {
                    text-align: right;
                }
            }
            span {
                display: block;
            }
            span.field-description {
                text-transform: uppercase;
                color: #787878;
                font-size: 125;
                font-weight: 600;
            }
            span.field-value {
                margin-top: 0.5vh;
                font-weight: 200;
            }
        }

        ul.payment-order-routing {
            width: 100%;
            padding-inline-start: 0;

            li {
                border-top: 1px solid #787878;
                padding: 2vh 0;
            }

            .transfer {
                cursor: pointer;
            }

            span.payment-method {
                display: block;
                text-align: center;
                font-size: 200%;
                font-weight: 800;
                &::before {
                    content: "Via ";
                }
            }

            div.payment-instructions {
                color: #505050;
            }

            li.payment-method.ethereum {
                display: grid;
                width: 100%;
                min-height: 300px;
                grid-template-areas: "head head head head head"
                                         "qrcode instructions instructions instructions instructions";

                span.payment-method {
                    grid-area: head;
                }

                canvas {
                    grid-area: qrcode;
                    width: 200px;
                    height: 200px;
                }

                div.payment-instructions {
                    grid-area: instructions;
                    justify-content: left;

                    .transfer.address {
                        display: block;
                        margin: 1vh auto;
                        font-weight: 800;
                    }
                }
            }

            dl {
                display: inline-grid;
                grid-template-columns: 35% auto;
                grid-template-rows: 2vh;
            }
            dt {
                &::after {
                    content: ": ";
                }
            }
        }
    }

}
</style>
