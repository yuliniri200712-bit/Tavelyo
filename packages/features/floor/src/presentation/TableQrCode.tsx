import qrcode from 'qrcode-generator';
import { useMemo } from 'react';

/** Margen alrededor del código, en módulos: la «zona de silencio» que exige la norma QR. */
const QUIET_ZONE = 4;

/**
 * Trazado SVG de un QR (nivel de corrección M, versión automática): un cuadrado de 1×1 por módulo
 * oscuro. Se dibuja en React, sin insertar HTML generado.
 */
export function qrPath(text: string): { readonly size: number; readonly path: string } {
  const code = qrcode(0, 'M');
  code.addData(text);
  code.make();
  const count = code.getModuleCount();
  const parts: string[] = [];
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (code.isDark(row, col)) parts.push(`M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`);
    }
  }
  return { size: count + QUIET_ZONE * 2, path: parts.join('') };
}

export interface TableQrCodeProps {
  /** Dirección completa que abre la carta de la mesa. */
  readonly url: string;
  /** Nombre accesible, p. ej. «Código QR de la mesa M1». */
  readonly label: string;
}

export function TableQrCode({ url, label }: TableQrCodeProps) {
  const { size, path } = useMemo(() => qrPath(url), [url]);
  return (
    <svg
      className="tv-qr"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect className="tv-qr__background" width={size} height={size} />
      <path className="tv-qr__modules" d={path} />
    </svg>
  );
}
