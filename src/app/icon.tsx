import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon gerado: monograma OT. em preto e branco. Trocar pelo logo vetorial quando o dono enviar. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#f4f4f2",
        fontSize: 30,
        fontWeight: 900,
        letterSpacing: -1,
        fontFamily: "Arial, sans-serif",
      }}
    >
      OT.
    </div>,
    size,
  );
}
