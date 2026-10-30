import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    response = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    // Validate the user and refresh the session if necessary.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isAuthRoute =
        pathname === "/login" || pathname === "/signup";

    const isProtectedRoute =
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/products" ||
        pathname.startsWith("/products/") ||
        pathname === "/pos" ||
        pathname.startsWith("/pos/") ||
        pathname === "/sales" ||
        pathname.startsWith("/sales/") ||
        pathname === "/finance" ||
        pathname.startsWith("/finance/") ||
        pathname === "/setup-store" ||
        pathname.startsWith("/setup-store/");

    // Redirect unauthenticated users from protected routes.
    if (!user && isProtectedRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        redirectUrl.search = "";

        const redirectResponse = NextResponse.redirect(redirectUrl);

        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });

        return redirectResponse;
    }

    // Redirect authenticated users away from login and signup.
    if (user && isAuthRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        redirectUrl.search = "";

        const redirectResponse = NextResponse.redirect(redirectUrl);

        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });

        return redirectResponse;
    }

    // Redirect the root page.
    if (pathname === "/") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = user ? "/dashboard" : "/login";
        redirectUrl.search = "";

        const redirectResponse = NextResponse.redirect(redirectUrl);

        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });

        return redirectResponse;
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};