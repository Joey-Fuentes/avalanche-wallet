import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { getAddressHistory } from '@/explorer_api'

import { HistoryState } from '@/store/modules/history/types'
import { avm, pChain } from '@/AVA'

const history_module: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        isUpdating: false,
        transactions: [],
    },
    mutations: {
        clear(state) {
            state.transactions = []
        },
    },
    actions: {
        async updateTransactionHistory({ state, rootState, rootGetters }) {
            let wallet = rootState.activeWallet
            if (!wallet) return

            // @ts-ignore
            let network = rootState.Network.selectedNetwork

            // can't update if there is no explorer or no wallet
            if (!network.explorerUrl || rootState.address === null) {
                return false
            }

            state.isUpdating = true

            let addresses: string[] = wallet.getHistoryAddresses()

            // this shouldnt ever happen, but to avoid getting every transaction...
            if (addresses.length === 0) {
                state.isUpdating = false
                return
            }

            let offset = 0
            let limit = 20

            let data = await getAddressHistory(addresses, limit, offset, avm.getBlockchainID())
            let dataP = await getAddressHistory(addresses, limit, offset, pChain.getBlockchainID())

            let transactions = data.transactions.concat(dataP.transactions)

            state.transactions = transactions
            state.isUpdating = false
        },
    },
}

export default history_module
