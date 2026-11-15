// Barrel del sistema de diseño: todo componente de UI reutilizable se crea en
// src/design-system/components/ y se exporta desde acá. El resto del front
// importa siempre desde "../design-system", nunca del archivo directo.
export { Button } from "./components/Button";
export { EnlaceBoton, type VarianteBoton } from "./components/EnlaceBoton";
export { Card } from "./components/Card";
export { Fuente } from "./components/Fuente";
export { SelectorTema } from "./components/SelectorTema";
export { Pestanas, PanelPestana, type Pestana } from "./components/Pestanas";
export { SelloVerificacion, type EstadoVerificacion } from "./components/SelloVerificacion";
export { ChipCategoria, type Categoria } from "./components/ChipCategoria";
export { FichaTecnica, DatoFicha } from "./components/FichaTecnica";
