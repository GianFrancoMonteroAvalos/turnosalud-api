TurnoSalud API

API REST desarrollada con Spring Boot para la gestión de pacientes, prácticas de diagnóstico por imágenes y turnos médicos.

El proyecto fue realizado como trabajo final del curso Back-End Java de Talento Tech Buenos Aires.

Descripción

TurnoSalud API permite administrar información relacionada con la asignación de turnos médicos para prácticas de diagnóstico por imágenes.

La aplicación ofrece operaciones para:

Registrar y administrar pacientes.
Registrar prácticas médicas.
Crear turnos asociados a un paciente.
Asignar una o varias prácticas a un turno.
Consultar, actualizar y eliminar registros.
Modificar el estado de un turno.
Validar reglas de negocio.
Persistir la información en una base de datos MySQL.

El proyecto toma como referencia general los sistemas de gestión de turnos sanitarios, pero fue desarrollado con un alcance académico y simplificado.

Objetivos

El objetivo principal es aplicar los conceptos aprendidos durante el curso:

Desarrollo de APIs REST con Spring Boot.
Operaciones CRUD.
Persistencia con MySQL.
Spring Data JPA.
Relaciones entre entidades.
Validaciones.
Excepciones personalizadas.
Arquitectura organizada en capas.
Pruebas de endpoints con Thunder Client.


Estructura del proyecto
src/main/java/com/techlab/turnosaludapi/
├── controller/
│   ├── PacienteController.java
│   ├── PracticaController.java
│   └── TurnoController.java
├── dto/
│   └── TurnoRequest.java
├── exception/
│   ├── DocumentoDuplicadoException.java
│   ├── GlobalExceptionHandler.java
│   ├── PacienteNoEncontradoException.java
│   ├── PracticaNoEncontradaException.java
│   ├── TurnoDuplicadoException.java
│   └── TurnoNoEncontradoException.java
├── model/
│   ├── EstadoTurno.java
│   ├── Paciente.java
│   ├── Practica.java
│   └── Turno.java
├── repository/
│   ├── PacienteRepository.java
│   ├── PracticaRepository.java
│   └── TurnoRepository.java
├── service/
│   ├── PacienteService.java
│   ├── PracticaService.java
│   └── TurnoService.java
└── TurnosaludApiApplication.java


Configuración de la base de datos

Crear la base de datos:

CREATE DATABASE turnosalud;

Configurar el archivo:

src/main/resources/application.properties

Ejemplo de configuración local:

spring.application.name=turnosalud-api

spring.datasource.url=jdbc:mysql://localhost:3306/turnosalud
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080

No se recomienda subir contraseñas reales al repositorio.

Cómo ejecutar el proyecto

Clonar el repositorio:

git clone https://github.com/GianFrancoMonteroAvalos/turnosalud-api.git

Ingresar a la carpeta:

cd turnosalud-api

En Windows:

.\mvnw.cmd spring-boot:run

En Linux o macOS:

./mvnw spring-boot:run

La API quedará disponible en:

http://localhost:8080
Endpoints
Prácticas
Método	Endpoint	Descripción
GET	/practicas	Lista todas las prácticas
GET	/practicas/{id}	Busca una práctica por ID
POST	/practicas	Crea una práctica
PUT	/practicas/{id}	Actualiza una práctica
DELETE	/practicas/{id}	Elimina una práctica
Crear una práctica
POST /practicas
{
  "nombre": "TC DE CEREBRO",
  "modalidad": "TC",
  "duracionMinutos": 15
}
Pacientes
Método	Endpoint	Descripción
GET	/pacientes	Lista todos los pacientes
GET	/pacientes/{id}	Busca un paciente por ID
GET	/pacientes/documento/{documento}	Busca un paciente por documento
POST	/pacientes	Crea un paciente
PUT	/pacientes/{id}	Actualiza un paciente
DELETE	/pacientes/{id}	Elimina un paciente
Crear un paciente
POST /pacientes
{
  "nombre": "Gian",
  "apellido": "Montero",
  "documento": "30111222",
  "email": "gian.montero@gmail.com",
  "telefono": "1123456789"
}
Turnos
Método	Endpoint	Descripción
GET	/turnos	Lista todos los turnos
GET	/turnos/{id}	Busca un turno por ID
POST	/turnos	Crea un turno
PUT	/turnos/{id}	Actualiza un turno
PATCH	/turnos/{id}/estado	Cambia el estado del turno
DELETE	/turnos/{id}	Elimina un turno
Crear un turno
POST /turnos
{
  "pacienteId": 1,
  "fecha": "2026-07-20",
  "hora": "09:30",
  "practicaIds": [1]
}
Cambiar el estado de un turno
PATCH /turnos/1/estado?estado=CONFIRMADO
