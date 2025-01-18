# Ejecutar el backend en una nueva consola
Start-Process powershell -ArgumentList "-NoLogo -NoProfile -Command `"uvicorn main:app --host 127.0.0.1 --port 8000 --reload`""

# Ejecutar el frontend en una nueva consola
Start-Process powershell -ArgumentList "-NoLogo -NoProfile -Command `"cd .\eventual; npm run dev`""
