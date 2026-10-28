## Purpose

Permitir que las personas creen una cuenta e inicien sesión con email y contraseña, mantener su sesión entre visitas y restringir las páginas privadas a usuarios autenticados.

## ADDED Requirements

### Requirement: Registro con email y contraseña
El sistema SHALL permitir crear una cuenta nueva con un email válido y una contraseña de al menos 8 caracteres. El sistema MUST rechazar emails ya registrados y entradas inválidas con un mensaje de error comprensible, sin revelar detalles internos.

#### Scenario: Registro exitoso
- **WHEN** un visitante envía el formulario de registro con un email no registrado y una contraseña válida
- **THEN** se crea la cuenta y el visitante recibe confirmación de que debe verificar su email o queda con sesión iniciada, según la configuración de confirmación del proyecto

#### Scenario: Contraseña demasiado corta
- **WHEN** un visitante envía el formulario con una contraseña de menos de 8 caracteres
- **THEN** no se crea la cuenta y se muestra un error indicando la longitud mínima

#### Scenario: Email ya registrado
- **WHEN** un visitante intenta registrarse con un email que ya tiene cuenta
- **THEN** no se crea una cuenta duplicada y se muestra un error genérico

### Requirement: Inicio de sesión
El sistema SHALL permitir iniciar sesión con email y contraseña correctos y MUST rechazar credenciales incorrectas con un mensaje que no indique cuál de los dos datos falló.

#### Scenario: Credenciales correctas
- **WHEN** un usuario registrado envía su email y contraseña correctos
- **THEN** se inicia la sesión y el usuario es redirigido a la página privada de inicio

#### Scenario: Credenciales incorrectas
- **WHEN** alguien envía un email inexistente o una contraseña incorrecta
- **THEN** no se inicia sesión y se muestra el mensaje "Email o contraseña incorrectos"

### Requirement: Persistencia de la sesión
El sistema SHALL mantener la sesión del usuario entre recargas y navegaciones mediante cookies seguras (HttpOnly en producción) y MUST renovar la sesión de forma transparente mientras siga siendo válida.

#### Scenario: Recarga con sesión activa
- **WHEN** un usuario con sesión iniciada recarga una página privada
- **THEN** la página se muestra sin pedir de nuevo las credenciales

#### Scenario: Sesión expirada
- **WHEN** la sesión de un usuario expiró y no puede renovarse
- **THEN** el usuario es tratado como no autenticado

### Requirement: Cierre de sesión
El sistema SHALL permitir al usuario cerrar sesión, invalidando su sesión y eliminando las cookies asociadas.

#### Scenario: Cerrar sesión
- **WHEN** un usuario autenticado elige cerrar sesión
- **THEN** su sesión se invalida y es redirigido a la página de inicio de sesión

### Requirement: Protección de rutas privadas
El sistema MUST impedir el acceso a páginas y endpoints privados a quien no tenga sesión válida. Las páginas privadas SHALL redirigir al inicio de sesión y los endpoints privados SHALL responder 401.

#### Scenario: Visitante sin sesión abre una página privada
- **WHEN** un visitante sin sesión navega a una página privada
- **THEN** es redirigido a la página de inicio de sesión

#### Scenario: Petición sin sesión a un endpoint privado
- **WHEN** se llama a un endpoint privado de la API sin sesión válida
- **THEN** la respuesta tiene estado 401 y no incluye datos privados

#### Scenario: Usuario autenticado abre la página de login
- **WHEN** un usuario con sesión activa navega a la página de inicio de sesión
- **THEN** es redirigido a la página privada de inicio

### Requirement: Confidencialidad de credenciales del servidor
El sistema MUST NOT exponer al navegador ninguna credencial con privilegios administrativos sobre la base de datos; solo las claves públicas destinadas al cliente pueden llegar al navegador.

#### Scenario: Inspección del bundle del cliente
- **WHEN** se inspecciona el código JavaScript entregado al navegador
- **THEN** no contiene la clave de servicio (service role) de la base de datos
