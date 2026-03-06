"use client";

import React from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { groupBy } from "@progress/kendo-data-query";
import { circleIcon } from "@progress/kendo-svg-icons";
import { SvgIcon } from "@progress/kendo-react-common";

export type ThemeSwitcherItem = {
  swatch: string;
  theme: string;
  text: string;
};

const KENDO_THEME_CDN = "https://cdn.kendostatic.com/themes/7.2.1";

const themes: ThemeSwitcherItem[] = [
  {
    swatch: "default/default-main",
    theme: "default",
    text: "Main",
  },
  {
    swatch: "default/default-main-dark",
    theme: "default",
    text: "Main Dark",
  },
  {
    swatch: "default/default-ocean-blue",
    theme: "default",
    text: "Ocean Blue",
  },
  {
    swatch: "default/default-ocean-blue-a11y",
    theme: "default",
    text: "Ocean Blue a11y",
  },
  {
    swatch: "default/default-nordic",
    theme: "default",
    text: "Nordic",
  },
  {
    swatch: "default/default-purple",
    theme: "default",
    text: "Purple",
  },
  {
    swatch: "default/default-turquoise",
    theme: "default",
    text: "Turquoise",
  },
  {
    swatch: "bootstrap/bootstrap-main",
    theme: "bootstrap",
    text: "Main",
  },
  {
    swatch: "bootstrap/bootstrap-main-dark",
    theme: "bootstrap",
    text: "Main Dark",
  },
  {
    swatch: "bootstrap/bootstrap-nordic",
    theme: "bootstrap",
    text: "Nordic",
  },
  {
    swatch: "bootstrap/bootstrap-urban",
    theme: "bootstrap",
    text: "Urban",
  },
  {
    swatch: "bootstrap/bootstrap-vintage",
    theme: "bootstrap",
    text: "Vintage",
  },
  {
    swatch: "material/material-main",
    theme: "material",
    text: "Main",
  },
  {
    swatch: "material/material-main-dark",
    theme: "material",
    text: "Main Dark",
  },
  {
    swatch: "material/material-arctic",
    theme: "material",
    text: "Arctic",
  },
  {
    swatch: "material/material-lime-dark",
    theme: "material",
    text: "Lime Dark",
  },
  {
    swatch: "material/material-nova",
    theme: "material",
    text: "Nova",
  },
  {
    swatch: "fluent/fluent-main",
    theme: "fluent",
    text: "Main",
  },
];

const defaultTheme: ThemeSwitcherItem = {
  swatch: "default/default-main",
  theme: "default",
  text: "Main",
};

export interface ThemeSwitcherProps {
  /** Current theme item (controlled). If not set, uses defaultTheme. */
  value?: ThemeSwitcherItem | null;
  /** Called when user selects a theme. */
  onThemeChange?: (item: ThemeSwitcherItem) => void;
  /** 'default' = full width (e.g. sidebar/settings). 'compact' = narrow for navbar. */
  variant?: "default" | "compact";
  className?: string;
}

export function ThemeSwitcher({
  value,
  onThemeChange,
  variant = "default",
  className,
}: ThemeSwitcherProps) {
  const groupedData = React.useMemo(() => {
    const grouped = groupBy(themes, [{ field: "theme" }]);
    return (grouped as { items: unknown[] }[]).reduce<ThemeSwitcherItem[]>(
      (res, group) => [...res, ...(group.items as ThemeSwitcherItem[])],
      [],
    );
  }, []);

  const getOrCreateThemeLink = (): HTMLLinkElement | null => {
    if (typeof document === "undefined") return null;
    let link = document.head.querySelector<HTMLLinkElement>("link[data-kendo-theme]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-kendo-theme", "");
      link.href = `${KENDO_THEME_CDN}/${defaultTheme.swatch}.css`;
      document.head.appendChild(link);
    }
    return link;
  };

  const handleChange = (e: { value: ThemeSwitcherItem | null }) => {
    const item = e.value;
    if (!item) return;
    const link = getOrCreateThemeLink();
    if (link) {
      link.setAttribute("href", `${KENDO_THEME_CDN}/${item.swatch}.css`);
    }
    onThemeChange?.(item);
  };

  const itemRender = (li: React.ReactElement, itemProps: { dataItem: ThemeSwitcherItem }) => {
    let color: string;
    switch (itemProps.dataItem.theme) {
      case "default":
        color = "#ff6358";
        break;
      case "bootstrap":
        color = "#0275d8";
        break;
      case "material":
        color = "#3f51b5";
        break;
      default:
        color = "#323130";
    }
    const children = (li.props as { children?: React.ReactNode }).children;
    const itemChildren = (
      <span className="flex items-center gap-2">
        <SvgIcon icon={circleIcon} size={variant === "compact" ? "medium" : "xlarge"} color={color} />
        {children}
      </span>
    );
    return React.cloneElement(li, {}, itemChildren);
  };

  const isCompact = variant === "compact";

  return (
    <DropDownList
      value={value ?? defaultTheme}
      data={groupedData}
      itemRender={itemRender}
      textField="text"
      dataItemKey="swatch"
      groupField="theme"
      onChange={handleChange}
      className={className}
      style={{
        width: isCompact ? 140 : 300,
        minWidth: isCompact ? 120 : undefined,
        fontSize: isCompact ? "0.8125rem" : undefined,
      }}
    />
  );
}
