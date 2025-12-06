#Definir que tipo de aplicacion vamos a construir
FROM node 

#Definir donde se va a guardar y el nombre el proyecto/imagen
WORKDIR /eductplataform

#Copiar/mover el package desde el servidor local hacia el contenedor.
COPY package*.json ./

#instalar los paquetes del JSON
RUN npm install

#Copiar el resto de la aplicacion asi con COPY .ESPACIO. se copia.

COPY . .

#configuramos el puerto de exposicion. es el puerto donde se va a levantar el contenedor.

EXPOSE 8080

#comando de inicializacion de la aplicacion.
CMD [ "npm", "start" ]
#CMD [ "npm", "run","dev" ]