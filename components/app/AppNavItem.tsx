import Link from "next/link";

import { isNavigationItemActive, type NavigationItem } from "@/lib/navigation";

type AppNavItemProps = {
  item: NavigationItem;
  pathname: string;
  onNavigate?: () => void;
};

export function AppNavItem({ item, pathname, onNavigate }: AppNavItemProps) {
  const Icon = item.icon;
  const active = isNavigationItemActive(item, pathname);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className="app-nav-item"
      data-active={active}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
      {item.badge ? <small>{item.badge}</small> : null}
    </Link>
  );
}
