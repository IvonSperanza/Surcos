// Barrel del sistema de diseño: todo componente de UI reutilizable se crea en
// src/design-system/components/ y se exporta desde acá. El resto del front
// importa siempre desde "../design-system", nunca del archivo directo.
export { Button } from "./components/Button";
export { Card } from "./components/Card";
export { Fuente } from "./components/Fuente";
