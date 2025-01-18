def evento_schema(evento):
    return {
        "id": str(evento["_id"]),
        "nombre": evento["nombre"],
        "timestamp": evento["timestamp"],
        "lugar": evento["lugar"],
        "lat": evento["lat"],
        "lon": evento["lon"],
        "organizador": evento["organizador"],
        "imagen": evento.get("imagen")  # Evita errores si no tiene imagen
    }

def eventos_schema(eventos):
    return [evento_schema(evento) for evento in eventos]
