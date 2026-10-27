# Marca Chi-Ro Heirs

Identidad «white industrial» (ver `traspaso/11-integracion-white-industrial.md`): el logotipo es **texto nítido**
`CHI—RO`, con `HEIRS` muy pequeño y espaciado. Sin texturas, halos, sombras, filtros ni distorsión, a cualquier tamaño.

| Archivo | Uso |
|---|---|
| `png/icono-1024.png` | Icono de la app: `CHI` / `—RO` apilado, tinta sobre blanco cálido. Fuente de todos los iconos (`npx tauri icon marca/png/icono-1024.png`) |
| `png/logotipo-horizontal-tinta.png`, `-hueso.png` | Logotipo en una línea: `CHI—RO HEIRS` |
| `png/logotipo-apilado-tinta.png`, `-hueso.png` | `CHI—RO` con `HEIRS` debajo, como en el inicio de la app |

- **Tipografía:** Inter Tight 650 para `CHI—RO` (interletrado −0,079 em, con raya larga), DM Sans 600 para `HEIRS` (+0,23 em).
- **Color:** tinta `#181818` sobre `#f7f7f5`; hueso `#f3f3f1` solo sobre el lector oscuro `#171717`.
- **Regenerar:** `node herramientas/marca.mjs` (icono y logotipos) y `node herramientas/instalador.mjs` (ventanas del instalador).
- **Retirados:** el crismón ΧΡ (icono y marca de agua) y el logotipo «Aura» desenfocado; el dueño los rechazó.

Lema: «La Biblia para esta generación de herederos.» · Grito: **TOMA Y LEE.**
