import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const SHOP_LINKS = [
    { to: "/collections", label: "Tous les produits" },
    { to: "/collections?filtre=nouveautes", label: "Nouveautés" },
    { to: "/collections?filtre=vetements", label: "Vêtements" },
    { to: "/collections?filtre=accessoires", label: "Accessoires" },
];

export default function ShopDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const buttonRef = useRef(null);
    const { pathname } = useLocation();
    const isActive = pathname.startsWith("/collections") || pathname.startsWith("/shop");

    // Ferme le menu au clic à l'extérieur, avec Échap (focus rendu au bouton) ou quand le focus en sort
    useEffect(() => {
        if (!isOpen) return;
        const onClick = (event) => {
            if (!ref.current?.contains(event.target)) setIsOpen(false);
        };
        const onKey = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [isOpen]);

    return (
        <div
            className="relative"
            ref={ref}
            onBlur={(event) => {
                if (!ref.current?.contains(event.relatedTarget)) setIsOpen(false);
            }}
        >
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="menu-boutique"
                className={`relative flex min-h-11 items-center gap-1 uppercase tracking-wide transition-colors hover:text-amber-700 ${
                    isActive
                        ? "text-amber-700 after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:bg-amber-700"
                        : ""
                }`}
            >
                Boutique
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <ul
                    id="menu-boutique"
                    className="absolute left-0 top-full z-50 mt-2 w-60 border border-black bg-cream p-2 normal-case tracking-normal shadow-[6px_6px_0_0_#0a0a0a]"
                >
                    {SHOP_LINKS.map((link) => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                className="flex min-h-11 items-center px-4 text-sm font-medium transition-colors hover:bg-amber-100 hover:text-amber-700"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
