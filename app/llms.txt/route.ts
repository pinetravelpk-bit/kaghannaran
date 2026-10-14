import { llmsText } from "@/lib/llms";

export const revalidate = 600;

export async function GET() {
  return new Response(await llmsText(false), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
