## Purpose

Exponer un endpoint público y liviano que indique si la aplicación está funcionando y si puede comunicarse con la base de datos, para verificar cada despliegue y diagnosticar fallos de configuración.

## ADDED Requirements

### Requirement: Endpoint de salud
El sistema SHALL exponer `GET /api/health` sin autenticación, respondiendo JSON con los campos `status` (`ok` o `degraded`), `database` (`ok` o `error`) y `timestamp` en ISO 8601.

#### Scenario: Todo funciona
- **WHEN** se llama a `GET /api/health` y la base de datos responde
- **THEN** la respuesta tiene estado 200 y el cuerpo incluye `"status": "ok"` y `"database": "ok"`

#### Scenario: Base de datos inaccesible
- **WHEN** se llama a `GET /api/health` y la base de datos no responde o rechaza la conexión
- **THEN** la respuesta tiene estado 503 y el cuerpo incluye `"status": "degraded"` y `"database": "error"`

### Requirement: Sin filtración de información sensible
La respuesta del endpoint de salud MUST NOT incluir secretos, cadenas de conexión, mensajes de error internos ni datos de usuarios.

#### Scenario: Error de conexión
- **WHEN** la verificación de base de datos falla con un error interno
- **THEN** el cuerpo de la respuesta solo contiene los campos definidos, sin el mensaje ni la traza del error

### Requirement: Respuesta no cacheada y acotada en tiempo
El endpoint de salud MUST reflejar el estado actual en cada llamada (sin caché) y SHALL responder en menos de 5 segundos aunque la base de datos no conteste.

#### Scenario: Base de datos lenta
- **WHEN** la base de datos no responde dentro del tiempo límite
- **THEN** el endpoint responde 503 con `"database": "error"` antes de 5 segundos

#### Scenario: Llamadas consecutivas
- **WHEN** se llama dos veces seguidas al endpoint
- **THEN** cada respuesta tiene su propio `timestamp` y la cabecera indica que no debe almacenarse en caché
