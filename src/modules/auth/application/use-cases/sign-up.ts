import type { AuthGateway } from "../../ports/auth-gateway";

export async function signUp(
    authGateway: AuthGateway,
    email: string,
    password: string,
) {
    return authGateway.signUp(email, password);
}