// Composition root: arma todos los módulos e inyecta sus dependencias.
// Cada módulo nuevo se crea acá con `createXModule({ db, ... })` y se
// devuelve en el objeto para que `app.ts` monte su router.
export function createContainer() {
    return {};
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
