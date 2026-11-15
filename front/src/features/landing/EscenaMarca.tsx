import { useCallback, useEffect, useRef } from "react";
import styles from "./landing.module.css";

// Animación de marca (design-system/README.md, "Movimiento"): la botella se
// vuelca sobre el cajón, el vino se derrama, las uvas ruedan, el satélite
// escanea el campo y brotan los plantines. Un clic la repite.
const PIVOTE = { x: 840, y: 172 };
const BOCA = { x: 654, y: 150 };
const SUELO = 248;
const DESTINOS_UVAS = [678, 662, 641, 627, 610, 588, 569, 546, 521, 498, 463, 431, 392, 334, 268, 196, 112];
const UVAS = DESTINOS_UVAS.map((destino, i) => ({ destino, radio: 9 + (i % 3) - 1, i }));

const BROTES = [
    { x: 392, alto: 22, rx: 8 },
    { x: 468, alto: 28, rx: 9 },
    { x: 548, alto: 18, rx: 7 },
    { x: 936, alto: 30, rx: 9 }
];

const mover = (x: number, y: number, giro?: number) => `translate(${x}px,${y}px)${giro === undefined ? "" : ` rotate(${giro}deg)`}`;

// Colores como variables CSS dentro del SVG: el estilo inline sí resuelve var().
const relleno = (token: string) => ({ fill: `var(--${token})` });

export function EscenaMarca() {
    const botella = useRef<SVGGElement>(null);
    const charco = useRef<SVGEllipseElement>(null);
    const satelite = useRef<SVGGElement>(null);
    const orbita = useRef<SVGPathElement>(null);
    const haz = useRef<SVGPolygonElement>(null);
    const uvas = useRef<(SVGGElement | null)[]>([]);
    const brotes = useRef<(SVGGElement | null)[]>([]);
    const animaciones = useRef<Animation[]>([]);

    const reproducir = useCallback(() => {
        if (!botella.current || !charco.current || !satelite.current || !orbita.current || !haz.current) return;
        animaciones.current.forEach((a) => a.cancel());
        const nuevas: Animation[] = [];

        nuevas.push(
            botella.current.animate(
                [
                    { transform: mover(PIVOTE.x, PIVOTE.y, 0), easing: "cubic-bezier(.55,0,1,.6)" },
                    { transform: mover(PIVOTE.x, PIVOTE.y, -97), offset: 0.72, easing: "ease-out" },
                    { transform: mover(PIVOTE.x, PIVOTE.y, -87), offset: 0.86, easing: "ease-in-out" },
                    { transform: mover(PIVOTE.x, PIVOTE.y, -90) }
                ],
                { duration: 1100, delay: 300, fill: "both" }
            )
        );

        nuevas.push(
            charco.current.animate(
                [
                    { transform: "scaleX(0)", opacity: 0 },
                    { transform: "scaleX(.4)", opacity: 0.9, offset: 0.25 },
                    { transform: "scaleX(1)", opacity: 0.9 }
                ],
                { duration: 2200, delay: 1300, fill: "both", easing: "ease-out" }
            )
        );

        UVAS.forEach((u) => {
            const elemento = uvas.current[u.i];
            if (!elemento) return;
            const y = SUELO - u.radio;
            const k = u.i % 4;
            const x1 = Math.max(u.destino, BOCA.x - 12 - k * 6);
            const x2 = Math.max(u.destino, BOCA.x - 28 - k * 9);
            const x3 = Math.max(u.destino, BOCA.x - 42 - k * 12);
            const distancia = BOCA.x - u.destino;
            const giro = -(distancia / u.radio) * 57.3;
            nuevas.push(
                elemento.animate(
                    [
                        { transform: mover(BOCA.x, BOCA.y, 0), opacity: 0, easing: "cubic-bezier(.5,0,1,1)" },
                        { transform: mover(BOCA.x, BOCA.y, 0), opacity: 1, offset: 0.04, easing: "cubic-bezier(.5,0,1,1)" },
                        { transform: mover(x1, y, giro * 0.1), opacity: 1, offset: 0.3, easing: "cubic-bezier(0,0,.4,1)" },
                        { transform: mover(x2, y - 14 + (u.i % 3) * 4, giro * 0.25), offset: 0.42, easing: "cubic-bezier(.6,0,1,1)" },
                        { transform: mover(x3, y, giro * 0.4), offset: 0.54, easing: "cubic-bezier(.15,.6,.3,1)" },
                        { transform: mover(u.destino, y, giro), opacity: 1 }
                    ],
                    { duration: 1500 + distancia * 3, delay: 1050 + u.i * 110, fill: "both" }
                )
            );
        });

        brotes.current.forEach((brote, i) => {
            if (!brote) return;
            nuevas.push(
                brote.animate([{ transform: "scale(0)" }, { transform: "scale(1.08)", offset: 0.7 }, { transform: "scale(1)" }], {
                    duration: 700,
                    delay: 3600 + i * 220,
                    fill: "both",
                    easing: "ease-out"
                })
            );
        });

        const largo = orbita.current.getTotalLength();
        const pasos = Array.from({ length: 21 }, (_, s) => orbita.current!.getPointAtLength(largo * (0.04 + (0.5 * s) / 20)));
        const fin = pasos[pasos.length - 1];
        nuevas.push(
            satelite.current.animate(
                pasos.map((p) => ({ transform: mover(p.x, p.y) })),
                { duration: 3600, delay: 200, fill: "both", easing: "cubic-bezier(.3,.1,.4,1)" }
            )
        );

        haz.current.setAttribute("points", `${fin.x},${fin.y + 10} ${fin.x - 150},${SUELO} ${fin.x + 40},${SUELO}`);
        nuevas.push(
            haz.current.animate([{ opacity: 0 }, { opacity: 0.16, offset: 0.3 }, { opacity: 0.16, offset: 0.7 }, { opacity: 0 }], {
                duration: 1400,
                delay: 4300,
                fill: "both"
            })
        );

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) nuevas.forEach((a) => a.finish());
        animaciones.current = nuevas;
    }, []);

    useEffect(() => {
        reproducir();
        const enCurso = animaciones;
        return () => enCurso.current.forEach((a) => a.cancel());
    }, [reproducir]);

    return (
        <div className={styles.escena} title="Clic para repetir la animación" onClick={reproducir}>
            <svg viewBox="0 0 960 288" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <rect style={relleno("tierra")} x="0" y="248" width="960" height="40" />
                {[258, 268, 278].map((y) => (
                    <rect key={y} style={{ ...relleno("arcilla"), opacity: 0.55 }} x="0" y={y} width="960" height="4" rx="2" />
                ))}
                <polygon ref={haz} style={{ ...relleno("cielo"), opacity: 0 }} points="0,0 0,0 0,0" />
                <g>
                    {BROTES.map((b, i) => (
                        <g
                            key={b.x}
                            ref={(el) => {
                                brotes.current[i] = el;
                            }}
                            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                        >
                            <path d={`M${b.x} 248 V${248 - b.alto}`} style={{ stroke: "var(--oliva)", strokeWidth: 3, strokeLinecap: "round", fill: "none" }} />
                            <ellipse style={relleno("oliva")} cx={b.x - 7} cy={250 - b.alto} rx={b.rx} ry={b.rx / 2} transform={`rotate(-30 ${b.x - 7} ${250 - b.alto})`} />
                            <ellipse style={relleno("oliva")} cx={b.x + 7} cy={245 - b.alto} rx={b.rx} ry={b.rx / 2} transform={`rotate(30 ${b.x + 7} ${245 - b.alto})`} />
                        </g>
                    ))}
                </g>
                <g>
                    <rect style={relleno("tierra")} x="700" y="172" width="200" height="76" rx="4" />
                    {[172, 200, 228].map((y) => (
                        <rect key={y} style={relleno("arcilla")} x="700" y={y} width="200" height="20" rx="4" />
                    ))}
                    <rect style={relleno("tierra")} x="700" y="172" width="12" height="76" rx="4" />
                    <rect style={relleno("tierra")} x="888" y="172" width="12" height="76" rx="4" />
                </g>
                <ellipse ref={charco} style={{ ...relleno("malbec"), transformBox: "fill-box", transformOrigin: "50% 50%" }} cx="652" cy="250" rx="58" ry="5" />
                <g ref={botella} style={{ transformBox: "view-box" }}>
                    <rect style={relleno("tierra")} x="0" y="-120" width="44" height="120" rx="6" />
                    <path style={relleno("tierra")} d="M0 -114 C0 -136 14 -138 14 -150 L30 -150 C30 -138 44 -136 44 -114 Z" />
                    <rect style={relleno("tierra")} x="14" y="-178" width="16" height="32" />
                    <rect style={relleno("malbec")} x="12" y="-184" width="20" height="24" rx="2" />
                    <rect style={relleno("arcilla-soft")} x="5" y="-92" width="34" height="52" rx="3" />
                    <rect style={relleno("trigo")} x="5" y="-80" width="34" height="8" />
                    <rect style={relleno("malbec")} x="12" y="-62" width="20" height="4" rx="2" />
                    <rect style={relleno("malbec")} x="15" y="-54" width="14" height="4" rx="2" />
                </g>
                <path
                    ref={orbita}
                    d="M500 70 Q740 -14 980 58"
                    style={{ fill: "none", stroke: "var(--cielo)", strokeWidth: 1.5, strokeDasharray: "2 7", strokeLinecap: "round", opacity: 0.65 }}
                />
                <g ref={satelite} style={{ transformBox: "view-box" }}>
                    <rect style={{ ...relleno("cielo-soft"), stroke: "var(--cielo)", strokeWidth: 1.5 }} x="-24" y="-3" width="15" height="6" rx="1" />
                    <rect style={{ ...relleno("cielo-soft"), stroke: "var(--cielo)", strokeWidth: 1.5 }} x="9" y="-3" width="15" height="6" rx="1" />
                    <rect style={relleno("cielo")} x="-8" y="-5" width="16" height="10" rx="2" />
                    <rect style={relleno("cielo")} x="-1" y="5" width="2" height="5" />
                </g>
                <g>
                    {UVAS.map((u) => (
                        <g
                            key={u.i}
                            ref={(el) => {
                                uvas.current[u.i] = el;
                            }}
                            style={{ transformBox: "view-box", opacity: 0 }}
                        >
                            <circle style={relleno("malbec")} r={u.radio} />
                            <circle style={{ ...relleno("malbec-soft"), opacity: 0.7 }} r={Math.max(2, u.radio * 0.28)} cx={-u.radio * 0.35} cy={-u.radio * 0.35} />
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
}
