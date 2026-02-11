/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string
    readonly VITE_CHAIN_ID: string
    readonly VITE_HUNGERBLOCK_ADDRESS: string
    readonly VITE_REWARD_TOKEN_ADDRESS: string
    readonly VITE_ACHIEVEMENT_BADGE_ADDRESS: string
    readonly VITE_ALCHEMY_RPC_URL: string
    readonly VITE_WALLETCONNECT_PROJECT_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
