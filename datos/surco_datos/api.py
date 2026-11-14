"""Servicio de datos de Surco: NASA y satélites en tiempo real.

Levantar: uvicorn surco_datos.api:app --reload --port 8000
Responde con el mismo sobre que back/ ({success, data} / {success, errors}).
"""

import os
from dataclasses import asdict
from datetime import date, timedelta
from typing import Any, Literal

import requests
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

from surco_datos import ciclos, power, sentinel2, suelo
from surco_datos.cache import clave, con_cache
from surco_datos.geometria import area_ha, centroide

AREA_MAXIMA_HA = 500
DIAS_MAXIMOS = 3 * 366
UMBRAL_SUELO_DESNUDO = 0.3

app = FastAPI(title="Surco · datos")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGIN", "http://localhost:5173").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ErrorDeDatos(Exception):
    def __init__(self, status: int, codigo: str, mensaje: str):
        self.status, self.codigo, self.mensaje = status, codigo, mensaje


def ok(data: Any) -> dict:
    return {"success": True, "data": data}


def error(status: int, codigo: str, mensaje: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"success": False, "errors": [{"code": codigo, "message": mensaje}]})


@app.exception_handler(ErrorDeDatos)
async def manejar_error_de_datos(_: Request, exc: ErrorDeDatos) -> JSONResponse:
    return error(exc.status, exc.codigo, exc.mensaje)


@app.exception_handler(requests.RequestException)
async def manejar_fuente_caida(_: Request, exc: requests.RequestException) -> JSONResponse:
    # La fuente externa (NASA POWER, SoilGrids) no respondió: es un 502, no
    # un error de Surco. El detalle va al log, no al cliente.
    print("FUENTE EXTERNA:", repr(exc))
    host = exc.request.url.split("/")[2] if exc.request is not None else "una fuente externa"
    return error(502, "BadGateway", f"{host} no respondió; probá de nuevo en un rato")


@app.exception_handler(RequestValidationError)
async def manejar_validacion(_: Request, exc: RequestValidationError) -> JSONResponse:
    primero = exc.errors()[0]
    campo = ".".join(str(p) for p in primero["loc"][1:])
    return error(400, "ValidationError", f"{campo}: {primero['msg']}")


class Poligono(BaseModel):
    type: Literal["Polygon"]
    coordinates: list[list[tuple[float, float]]] = Field(min_length=1)

    @model_validator(mode="after")
    def anillo_cerrado(self) -> "Poligono":
        exterior = self.coordinates[0]
        if len(exterior) < 4 or exterior[0] != exterior[-1]:
            raise ValueError("el polígono necesita al menos 3 vértices y el anillo tiene que estar cerrado")
        return self


class PedidoParcela(BaseModel):
    geometria: Poligono


class PedidoParcelaPeriodo(PedidoParcela):
    desde: date | None = None
    hasta: date | None = None


@app.get("/salud")
def salud() -> dict:
    return ok({"estado": "ok"})


def periodo(pedido: PedidoParcelaPeriodo) -> tuple[date, date]:
    hasta = pedido.hasta or date.today()
    desde = pedido.desde or hasta - timedelta(days=365)
    if desde >= hasta:
        raise ErrorDeDatos(400, "ValidationError", "desde tiene que ser anterior a hasta")
    if (hasta - desde).days > DIAS_MAXIMOS:
        raise ErrorDeDatos(400, "ValidationError", "el período máximo es de 3 años")
    return desde, hasta


def geometria_valida(pedido: PedidoParcela) -> tuple[dict, float]:
    geometria = pedido.geometria.model_dump()
    hectareas = area_ha(geometria)
    if hectareas > AREA_MAXIMA_HA:
        raise ErrorDeDatos(400, "ValidationError", f"la parcela tiene {hectareas:.0f} ha; el máximo es {AREA_MAXIMA_HA} ha")
    return geometria, hectareas


@app.post("/ndvi")
def ndvi(pedido: PedidoParcelaPeriodo) -> dict:
    geometria, hectareas = geometria_valida(pedido)
    desde, hasta = periodo(pedido)

    def calcular() -> dict:
        serie = sentinel2.serie_pasadas(geometria, desde, hasta)
        return {
            "fuente": sentinel2.FUENTE,
            "resolucion_m": sentinel2.RESOLUCION_M,
            "consultado": date.today().isoformat(),
            "desde": desde.isoformat(),
            "hasta": hasta.isoformat(),
            "area_ha": round(hectareas, 2),
            "umbral_suelo_desnudo": UMBRAL_SUELO_DESNUDO,
            "serie": [asdict(p) for p in serie],
        }

    # La fecha de hoy entra en la clave: una consulta abierta ("hasta hoy") se
    # recalcula una vez por día, cuando puede haber pasadas nuevas.
    historico = con_cache("pasadas", clave(geometria, desde, hasta, date.today()), calcular)
    # El análisis no se cachea: es barato y así un ajuste del algoritmo se ve
    # sin volver a bajar imágenes.
    return ok({**historico, "analisis": analizar_historico(historico)})


def analizar_historico(historico: dict) -> dict:
    serie = historico["serie"]
    analisis = ciclos.analizar(
        [date.fromisoformat(str(p["fecha"])) for p in serie],
        [p["ndvi"] for p in serie],
        [p["ndti"] for p in serie],
        historico["umbral_suelo_desnudo"],
    )
    return asdict(analisis)


@app.post("/clima")
def clima(pedido: PedidoParcelaPeriodo) -> dict:
    geometria, _ = geometria_valida(pedido)
    desde, hasta = periodo(pedido)
    lat, lon = centroide(geometria)
    datos = con_cache("clima", clave(lat, lon, desde, hasta, date.today()), lambda: power.clima(lat, lon, desde, hasta))
    return ok({**datos, "consultado": date.today().isoformat()})


@app.post("/suelo")
def suelo_de_parcela(pedido: PedidoParcela) -> dict:
    geometria, _ = geometria_valida(pedido)
    lat, lon = centroide(geometria)
    # El suelo de SoilGrids es un mapa fijo: se cachea sin fecha.
    datos = con_cache("suelo", clave(lat, lon), lambda: suelo.suelo(lat, lon))
    if not datos["capas"]:
        raise ErrorDeDatos(404, "NotFound", "SoilGrids no tiene datos de suelo para este lugar (zona urbana o agua)")
    return ok(datos)
