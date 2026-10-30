import type { AuthGateway } from "../../ports/auth-gateway";

export async function signIn(
    authGateway: AuthGateway,
    email: string,
    password: string,
) {
    return authGateway.signIn(email, password);
}