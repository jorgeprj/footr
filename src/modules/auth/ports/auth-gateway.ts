export interface AuthUser {
    id: string;
    email: string | undefined;
}

export interface AuthResult {
    user: AuthUser | null;
    error: string | null;
}

export interface AuthGateway {
    signIn(email: string, password: string): Promise<AuthResult>;

    signUp(email: string, password: string): Promise<AuthResult>;

    signOut(): Promise<void>;

    getUser(): Promise<AuthUser | null>;
}