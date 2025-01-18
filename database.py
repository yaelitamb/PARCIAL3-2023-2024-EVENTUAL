from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Leer URI de MongoDB desde las variables de entorno
MONGO_URI = os.getenv("MONGO_URI")

# Crear el cliente de MongoDB
client = MongoClient(MONGO_URI)

# Conectar a la base de datos específica
db = client.Eventual  

# Colecciones específicas
eventos_collection = db.eventos
log_collection = db.logs