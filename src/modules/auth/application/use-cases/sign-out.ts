import type { AuthGateway } from "../../ports/auth-gateway";

export async function signOut(authGateway: AuthGateway) {
    return authGateway.signOut();
}