#!/usr/bin/env bash

# merge_text.sh
# Combina en un solo archivo .txt el contenido de todos los archivos de texto
# encontrados en la carpeta especificada (excluyendo imágenes, archivos binarios
# y el directorio node_modules), evitando archivos mayores a 1 MB.

# Comprobamos si se ha pasado un argumento
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <carpeta>"
  exit 1
fi

CARPETA="$1"
OUTPUT="merged_output.txt"

# Limpiamos o creamos el archivo de salida
> "$OUTPUT"

# Recorremos todos los archivos dentro de la carpeta, excluyendo node_modules
while IFS= read -r -d '' ARCHIVO; do
  # Verificamos si es un archivo de texto usando su MIME type
  if file -b --mime-type "$ARCHIVO" | grep -q '^text/'; then
    # Verificamos que el tamaño del archivo sea menor o igual a 1 MB
    if [ $(stat --format=%s "$ARCHIVO") -le 1048576 ]; then
      # Obtenemos la fecha de modificación del archivo
      MOD_DATE=$(stat --format=%y "$ARCHIVO")
      # Agregamos la ruta del archivo y la fecha de modificación como encabezado
      echo "//$ARCHIVO - $MOD_DATE" >> "$OUTPUT"
      # Agregamos el contenido del archivo
      cat "$ARCHIVO" >> "$OUTPUT"
      # Insertamos una línea en blanco para separar archivos
      echo "" >> "$OUTPUT"
    else
      echo "Archivo omitido (mayor a 1 MB): $ARCHIVO"
    fi
  fi
done < <(find "$CARPETA" \( -path "$CARPETA/node_modules" -o -path "$CARPETA/.next" \) -prune -o -type f -print0)

echo "Se ha generado el archivo $OUTPUT con el contenido de los archivos de texto encontrados."
