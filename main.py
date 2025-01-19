from fastapi import FastAPI, HTTPException, Query
from models import Evento
from database import eventos_collection, log_collection
from schemas import evento_schema, eventos_schema
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia "*" por ["http://localhost:3000"] en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Cross-Origin-Opener-Policy", "Cross-Origin-Embedder-Policy"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response
    
@app.get("/logs")
async def get_logs():
    logs = log_collection.find().sort("timestamp", -1)  # Ordenar por timestamp descendente
    return [
        {
            "timestamp": log["timestamp"],
            "user": log["user"],
            "expiration": log["expiration"],
            "token": log["token"],
        }
        for log in logs
    ]

@app.get("/")
async def obtener_eventos(lat: float = Query(...), lon: float = Query(...)):
    proximos_eventos = eventos_collection.find({
        "$expr": {
            "$lt": [{
                "$sqrt": {
                    "$add": [
                        {"$pow": [{"$subtract": ["$lat", lat]}, 2]},
                        {"$pow": [{"$subtract": ["$lon", lon]}, 2]}
                    ]
                }
            }, 0.2]
        }
    }).sort("timestamp", 1)

    return eventos_schema(proximos_eventos)

@app.get("/eventos")
async def obtener_eventos():
    eventos = eventos_collection.find()
    return [evento_schema(evento) for evento in eventos]

@app.get("/eventos/{evento_id}")
async def obtener_evento(evento_id: str):
    """Obtener detalles de un evento por ID."""
    evento = eventos_collection.find_one({"_id": ObjectId(evento_id)})
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return evento_schema(evento)

@app.post("/eventos")
async def crear_evento(evento: Evento):
    """Crear un nuevo evento."""
    nuevo_evento = evento.dict()
    resultado = eventos_collection.insert_one(nuevo_evento)
    return {"id": str(resultado.inserted_id)}

@app.put("/eventos/{evento_id}")
async def actualizar_evento(evento_id: str, evento: Evento):
    """Actualizar un evento existente."""
    resultado = eventos_collection.update_one({"_id": ObjectId(evento_id)}, {"$set": evento.dict()})
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return {"mensaje": "Evento actualizado exitosamente"}

@app.delete("/eventos/{evento_id}")
async def borrar_evento(evento_id: str):
    """Eliminar un evento."""
    resultado = eventos_collection.delete_one({"_id": ObjectId(evento_id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return {"mensaje": "Evento eliminado exitosamente"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))  # Usar el puerto proporcionado por Railway
    uvicorn.run(app, host="0.0.0.0", port=port)