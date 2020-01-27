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

    [name=time-remaining-progress-bar] {
        &.ok div.vue-simple-progress-bar {
            background-color: green !important;
        }

        &.warning div.vue-simple-progress-bar {
            background-color: yellow !important;
        }

        &.critical div.vue-simple-progress-bar {
            background-color: red !important;
        }
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

    div.payment-order {
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

                &:first-child {
                    border-top: none
                }
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
                padding-top: 1em
            }

            li.payment-method.ethereum {
                display: grid;
                min-height: 300px;
                grid-template-areas: "head head head head head"
                                         "qrcode instructions instructions instructions instructions"
                                         "qrcode instructions instructions instructions instructions"
                                         "qrcode . . web3connector ."
                                         "qrcode . . . .";

                span.payment-method {
                    grid-area: head;
                }

                canvas {
                    grid-area: qrcode;
                    width: 200px;
                    height: 200px;
                }

                .payment-instructions {
                    grid-area: instructions;
                    justify-content: left;

                    .transfer.address {
                        display: block;
                        font-weight: 800;
                    }
                }

                .payment-order-web3-connector {
                    grid-area: web3connector
                }
            }

            li.payment-method {
                padding: 2vh 1em;
            }

            dl {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 2vh;
            }
            dt {
                &::after {
                    content: ": ";
                }
            }

            dd {
                display: inline;
                text-align: right;
                margin-inline-start: 0;
            }
        }

        div.payment-order-timer {
            padding: 0 1em;
            span.time-remaining-display {
                display: block;
                text-align: right;
            }
        }

        div.payment-order-action-panel {
            padding: 2vh 1em;

        }
    }

}
</style>
