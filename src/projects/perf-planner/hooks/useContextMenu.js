import { useState, useEffect } from "react";

export function useContextMenu() {
  const [menu, setMenu] = useState(null); // { x, y, variationId } | null

  function openMenu(e, variationId) {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, variationId });
  }

  function closeMenu() {
    setMenu(null);
  }

  useEffect(() => {
    if (!menu) return;
    const close = () => closeMenu();
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
    };
  }, [menu]);

  return { menu, openMenu, closeMenu };
}
