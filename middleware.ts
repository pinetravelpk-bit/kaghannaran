import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(req: NextRequest) {
  if (!URL_ || !KEY) return NextResponse.next(); // demo mode
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(URL_, KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if ((path.startsWith("/admin") || path.startsWith("/dashboard")) && !user) {
    const u = req.nextUrl.clone();
    u.pathname = "/auth/sign-in";
    u.searchParams.set("next", path);
    return NextResponse.redirect(u);
  }
  if (path.startsWith("/admin") && user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!data || !["admin", "moderator"].includes(data.role)) return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"] };
