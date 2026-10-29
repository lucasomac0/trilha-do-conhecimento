"use client";

// Imagem que some sozinha se o arquivo ainda não foi exportado do Canva.
export default function ImgOpcional(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt="" {...props} onError={(e) => (e.currentTarget.style.display = "none")} />;
}
