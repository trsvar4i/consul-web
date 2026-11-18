import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link / useRouter / usePathname that know about /uz and /ru
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
