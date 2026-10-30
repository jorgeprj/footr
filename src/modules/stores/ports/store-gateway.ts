export interface Store {
    id: string;
    name: string;
    slug: string;
}

export interface StoreGateway {
    createInitialStore(name: string): Promise<Store>;
    getCurrentUserStore(): Promise<Store | null>;
}