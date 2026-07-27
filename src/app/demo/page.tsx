import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";

/** Legacy /demo URL — forwards to unified onboarding with presenter tooling enabled. */
export default function DemoPage() {
  redirect(`${routes.onboarding}?presenter=true`);
}
