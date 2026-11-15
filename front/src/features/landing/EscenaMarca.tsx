import { useCallback, useEffect, useRef } from "react";
import styles from "./landing.module.css";

// Animación de marca (design-system/hero/surco-hero.html): amanece el sol, los
// paneles agrovoltaicos se orientan hacia él, la energía baja por los postes,
// brota el cultivo y un satélite pasa y escanea el campo. Un clic la repite.
const SUELO = 248;
const SOL = { x: 604, y: 86 };
const TOPE_POSTE = 176;
const POSTES = [700, 810, 920];
const BROTES: [number, number][] = [
    [468, 22], [516, 28], [556, 18], [652, 30], [676, 20], [748, 32], [772, 22], [858, 30], [884, 20], [944, 26]
];

const mover = (x: number, y: number, giro?: number) => `translate(${x}px,${y}px)${giro === undefined ? "" : ` rotate(${giro}deg)`}`;

// Los colores salen de los tokens: con estilo inline, var() sí se resuelve
// dentro del SVG y la escena cambia sola entre Día y Noche.
const relleno = (token: string) => ({ fill: `var(--${token})` });

function Brote({ x, alto, refBrote }: { x: number; alto: number; refBrote: (el: SVGGElement | null) => void }) {
    const tope = SUELO - alto;
    const r = 6 + alto / 6;
    return (
        <g ref={refBrote} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
            <path d={`M${x} ${SUELO} V${tope}`} style={{ stroke: "var(--hoja)", strokeWidth: 3, strokeLinecap: "round", fill: "none" }} />
            <ellipse style={relleno("hoja")} cx={x - r * 0.8} cy={tope + 2} rx={r} ry={r / 2} transform={`rotate(-30 ${x - r * 0.8} ${tope + 2})`} />
            <ellipse style={relleno("hoja")} cx={x + r * 0.8} cy={tope - 3} rx={r} ry={r / 2} transform={`rotate(30 ${x + r * 0.8} ${tope - 3})`} />
        </g>
    );
}

export function EscenaMarca() {
    const grilla = useRef<SVGRectElement>(null);
    const sol = useRef<SVGGElement>(null);
    const anillo = useRef<SVGCircleElement>(null);
    const satelite = useRef<SVGGElement>(null);
    const orbita = useRef<SVGPathElement>(null);
    const haz = useRef<SVGPolygonElement>(null);
    const paneles = useRef<(SVGGElement | null)[]>([]);
    const pulsos = useRef<(SVGCircleElement | null)[]>([]);
    const brotes = useRef<(SVGGElement | null)[]>([]);
    const animaciones = useRef<Animation[]>([]);

    const reproducir = useCallback(() => {
        if (!grilla.current || !sol.current || !anillo.current || !satelite.current || !orbita.current || !haz.current) return;
        animaciones.current.forEach((a) => a.cancel());
        const nuevas: Animation[] = [];

        nuevas.push(grilla.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: "both" }));
        nuevas.push(
            sol.current.animate(
                [
                    { transform: mover(SOL.x, 190), opacity: 0 },
                    { transform: mover(SOL.x, SOL.y), opacity: 1 }
                ],
                { duration: 1600, delay: 200, fill: "both", easing: "cubic-bezier(.2,.7,.3,1)" }
            )
        );

        paneles.current.forEach((panel, i) => {
            if (!panel) return;
            const x = POSTES[i];
            nuevas.push(
                panel.animate(
                    [
                        { transform: mover(x, TOPE_POSTE, 16) },
                        { transform: mover(x, TOPE_POSTE, -24), offset: 0.8 },
                        { transform: mover(x, TOPE_POSTE, -20) }
                    ],
                    { duration: 1200, delay: 1300 + i * 220, fill: "both", easing: "cubic-bezier(.4,0,.2,1)" }
                )
            );
        });

        pulsos.current.forEach((pulso, i) => {
            if (!pulso) return;
            const x = POSTES[i];
            nuevas.push(
                pulso.animate(
                    [
                        { transform: mover(x, TOPE_POSTE + 6), opacity: 0 },
                        { transform: mover(x, TOPE_POSTE + 6), opacity: 1, offset: 0.1 },
                        { transform: mover(x, SUELO), opacity: 1, offset: 0.55 },
                        { transform: mover(x - 70, SUELO), opacity: 0 }
                    ],
                    { duration: 1300, delay: 2600 + i * 260, iterations: 2, fill: "both", easing: "ease-in-out" }
                )
            );
        });

        brotes.current.forEach((brote, i) => {
            if (!brote) return;
            nuevas.push(
                brote.animate([{ transform: "scale(0)" }, { transform: "scale(1.08)", offset: 0.7 }, { transform: "scale(1)" }], {
                    duration: 700,
                    delay: 2900 + i * 120,
                    fill: "both",
                    easing: "ease-out"
                })
            );
        });

        const largo = orbita.current.getTotalLength();
        const pasos = Array.from({ length: 21 }, (_, s) => orbita.current!.getPointAtLength(largo * (0.02 + (0.55 * s) / 20)));
        const fin = pasos[pasos.length - 1];
        nuevas.push(
            satelite.current.animate(
                pasos.map((p) => ({ transform: mover(p.x, p.y) })),
                { duration: 3800, delay: 400, fill: "both", easing: "cubic-bezier(.3,.1,.4,1)" }
            )
        );
        haz.current.setAttribute("points", `${fin.x},${fin.y + 10} ${fin.x - 120},${SUELO} ${fin.x + 70},${SUELO}`);
        nuevas.push(
            haz.current.animate([{ opacity: 0 }, { opacity: 0.14, offset: 0.3 }, { opacity: 0.14, offset: 0.7 }, { opacity: 0 }], {
                duration: 1400,
                delay: 4300,
                fill: "both"
            })
        );

        // Con movimiento reducido: estado final y sin rotaciones continuas.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            nuevas.forEach((a) => a.finish());
        } else {
            nuevas.push(anillo.current.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 40000, iterations: Infinity }));
        }
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
                <defs>
                    <pattern id="escena-grilla" width="24" height="24" patternUnits="userSpaceOnUse" x="480" y="0">
                        <circle style={relleno("line")} cx="12" cy="12" r="1.4" />
                    </pattern>
                </defs>
                <rect ref={grilla} x="480" y="0" width="480" height="248" fill="url(#escena-grilla)" />

                <path
                    ref={orbita}
                    d="M740 74 Q880 -10 1010 46"
                    style={{ fill: "none", stroke: "var(--cielo)", strokeWidth: 1.5, strokeDasharray: "2 7", strokeLinecap: "round", opacity: 0.6 }}
                />
                <polygon ref={haz} style={{ ...relleno("cielo"), opacity: 0 }} points="0,0 0,0 0,0" />

                <g ref={sol} style={{ transformBox: "view-box" }}>
                    <circle
                        ref={anillo}
                        cx="0"
                        cy="0"
                        r="42"
                        style={{ fill: "none", stroke: "var(--sol)", strokeWidth: 3, strokeDasharray: "3 9", strokeLinecap: "round", transformBox: "fill-box", transformOrigin: "50% 50%" }}
                    />
                    <circle style={relleno("sol")} cx="0" cy="0" r="28" />
                </g>

                <rect style={relleno("hoja")} x="0" y={SUELO} width="960" height="40" />
                {[258, 268, 278].map((y) => (
                    <rect key={y} style={{ ...relleno("hoja-soft"), opacity: 0.35 }} x="0" y={y} width="960" height="4" rx="2" />
                ))}

                <g>
                    {BROTES.map(([x, alto], i) => (
                        <Brote
                            key={x}
                            x={x}
                            alto={alto}
                            refBrote={(el) => {
                                brotes.current[i] = el;
                            }}
                        />
                    ))}
                </g>

                <g>
                    {POSTES.map((x, i) => (
                        <g key={x}>
                            <rect style={relleno("ink-muted")} x={x - 2} y={TOPE_POSTE} width="4" height={SUELO - TOPE_POSTE} />
                            <g
                                ref={(el) => {
                                    paneles.current[i] = el;
                                }}
                                style={{ transformBox: "view-box", transform: mover(x, TOPE_POSTE, -20) }}
                            >
                                <rect style={relleno("cielo")} x="-46" y="-5" width="92" height="10" rx="3" />
                                {[-23, 0, 23].map((cx) => (
                                    <line key={cx} x1={cx} y1="-5" x2={cx} y2="5" style={{ stroke: "var(--surface-raised)", strokeWidth: 1.5, opacity: 0.7 }} />
                                ))}
                            </g>
                        </g>
                    ))}
                </g>

                <g>
                    {POSTES.map((x, i) => (
                        <circle
                            key={x}
                            ref={(el) => {
                                pulsos.current[i] = el;
                            }}
                            r="3.5"
                            style={{ ...relleno("sol"), transformBox: "view-box", opacity: 0 }}
                        />
                    ))}
                </g>

                <g ref={satelite} style={{ transformBox: "view-box" }}>
                    <rect style={{ ...relleno("cielo-soft"), stroke: "var(--cielo)", strokeWidth: 1.5 }} x="-24" y="-3" width="15" height="6" rx="1" />
                    <rect style={{ ...relleno("cielo-soft"), stroke: "var(--cielo)", strokeWidth: 1.5 }} x="9" y="-3" width="15" height="6" rx="1" />
                    <rect style={relleno("cielo")} x="-8" y="-5" width="16" height="10" rx="2" />
                    <rect style={relleno("cielo")} x="-1" y="5" width="2" height="5" />
                </g>
            </svg>
        </div>
    );
}
