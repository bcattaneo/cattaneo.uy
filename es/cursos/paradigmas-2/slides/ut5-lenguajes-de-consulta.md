# Lenguajes de consulta

### Paradigmas de Programación 2, Ingeniería y Licenciatura en Informática, FIT - UCU - 2026

<!-- .slide: data-background-color="#ffffff" -->

---

## Lenguajes de consulta

- Definiciones
- Ejemplos.

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Lenguajes de consulta

- Lenguajes para obtener datos de repositorios estructurados de información, e.g. bases de datos.
- Generalmente:
  - *Declarativos*: especifican *forma y condiciones* de los datos que se buscan, en lugar de las *operaciones* para obtenerlos.
  - *No Turing-completos*: no pueden expresar cualquier algoritmo.
  - *Dominio específico*: fuertemente *dependientes* del modelo de datos que se está consultando.
  - Incluyen capacidades de *manipulación* y *definición* de datos.

---

## Ejemplos

- *SQL* (Structured Query Language):
  - Estándar para consultar, manipular, definir y administrar bases de datos relacionales.
- *GraphQL*:
  - Creado por *Meta* para solucionar problemas comunes con APIs REST.
- *XQuery* & *XPath*:
  - Estándares complementarios para la consulta de contenido XML.
- *SPARQL*:
  - Lenguaje de consulta para repositorios RDF, y parte del *stack* de la *Web Semántica*.

---

## SQL

- Structured Query Language
- PostgreSQL

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Structured Query Language (1)

- Creado en los 1970s, por Donald Chamberlin & Raymond Boyce.
  - Primer lenguaje basado en el modelo relacional de bases de datos de Edgar Codd.
  - Popularizado por *Relational Software Inc*, para su producto el DBMS *Oracle*.
  - Estandarizado por la ANSI en 1986 y por la ISO en 1987.

---

## Structured Query Language (2)

- Se compone de tres sublenguajes:
  - *DQL (Data Query Language)*: `SELECT`.
  - *DML (Data Manipulation Language)*: `INSERT`, `UPDATE`, `DELETE`.
  - *DDL (Data Definition Language)*: `CREATE`, `ALTER`, `DROP`.

---

## PostgreSQL

- Derivado de Ingres (UC Berkeley) en los 1980s.
- Compite con MySQL como RDBMS de código abierto.
- Características:
  - Implementación muy completa del modelo relacional.
  - Buen soporte de SQL y PL/SQL.
  - Muy extensible: tipos, funciones, operadores e índices nuevos vía *extensiones*.
- Machine learning: *pgvector* <https://github.com/pgvector/pgvector>.
  - Agrega el tipo `vector` para guardar *embeddings* junto a los datos relacionales.
  - Búsqueda por similitud (distancia coseno, L2, producto interno) con índices HNSW o IVFFlat.
  - Base de muchos sistemas RAG (*Retrieval-Augmented Generation*) con LLMs.

```sql
SELECT id, contenido FROM documentos
ORDER BY embedding <=> '[0.12, -0.03, 0.88]'  -- distancia coseno
LIMIT 5;
```

---

## Preparación

- PostgreSQL 10+ instalado y funcionando.
  - Local: <https://www.postgresql.org/download/>.
  - Docker: <https://hub.docker.com/_/postgres/>.
- Verificar instalación con `psql`:

```sql
SELECT 'Hello world' AS hello;
```

- Importar base de datos de ejemplo:
  - DB Rental <https://www.postgresqltutorial.com/postgresql-getting-started/postgresql-sample-database/>

---

## Pregunta 1.1: Metadata

- ¿Cómo se le llama a las tablas donde el RDBMS guarda la metadata?
  - A. Catálogo.
  - B. Esquema del sistema.
  - C. Metadata.
  - D. La metadata no se guarda en tablas.
- Contestar vía Webasignatura.

---

## Pregunta 1.2: Tablas y columnas

- Se desea obtener un listado de las tablas de un esquema, incluyendo sus columnas y sus tipos de datos.
- ¿Cuál de las tablas del catálogo de PostgreSQL sería la mejor para extraer esta información?
  - A. `pg_catalog.tables`.
  - B. `information_schema.tables`.
  - C. `information_schema.columns`.
  - D. Ninguna de las otras.
- Contestar vía Webasignatura.

---

## Ejercicio 1.3: Node 🤝 PostgreSQL

- Crear un programa en Javascript para NodeJS que:
  - Se *conecte* a una base de datos PostgreSQL.
  - Obtenga la *lista de tablas y columnas* de un *esquema* dado.
  - Imprima la lista anterior en la *salida estándar en formato CSV*.
  - Se deben incluir: nombres de tablas y sus columnas, y los tipos de datos de cada columna.
- Usar el paquete `pg` en `npm`: <https://node-postgres.com/>.
- Esta entrega se ampliará, entregará y calificará.

---

## Ejercicio 1.4: pgMER

- Tomando el programa anterior para NodeJS:
  - Basándose en el catálogo de un esquema de PostgreSQL, inferir un diagrama MER (o ERD).
  - Generar el diagrama para *MermaidJS* <https://mermaid.js.org/>.
  - Tomar como referencia <https://mermaid.js.org/syntax/entityRelationshipDiagram.html>.
- Entregar via Webasignatura.

---

## Object Relational Mapping

- API orientada a objetos para representar una base de datos relacional.
- *Value Object*: representación de un registro de una tabla y opcionalmente otros registros relacionados.
  - Mapeo de tipos del RDBMS y el lenguaje de aplicación.
  - Interpretación de relaciones (e.g. 1a1, 1aN, NaN).
- *Data Access Object*: representación de una tabla (o vista).
  - Permite consultar y manipular la tabla.

---

## Ejercicio 2.1 class Table (1)

- Crear en Javascript la clase DAO `Table`.
- Se construye con un `pg.Client` y un nombre.

```javascript
const table = new Table(client, { table: 'table' });
```

- `async* _select()`: registros que cumplen restricciones de valores (opcionales).

```javascript
const query = await Array.fromAsync(table._select({ field1: v1 }));
```

- `async _insert()`: agrega un registro, retornándolo.

```javascript
const inserted = await table._insert({ field1: v1, field2: '' });
```

---

## Ejercicio 2.2 class Table (2)

- Agregar a la clase `Table` anterior.
- El constructor recibe la lista de campos de la clave primaria.

```javascript
const table = new Table(client, { table: 'table', pk: ['id'] });
```

- `async _delete()`: elimina un registro dados valores de campos.

```javascript
const deleted = await table._delete({ id });
```

- `async _update()`: modifica un registro dados valores de campos.

```javascript
const updated = await table._update({ id, field1: v1, field2: v2 });
```

---

## Ejercicio 2.3 class Table (3)

- Agregar a la clase `Table` anterior.
- Un método para construir la instancia en base a la información del catálogo.

```javascript
const table = await Table.new(client, 'table');
```

- Validar en los métodos anteriores campos y tipos.
- Extender `_update` para poder cambiar campos en la PK.

```javascript
const updated = await table._update(
  { id },
  { id: id2, field1: v1, field2: v2 },
);
```

---

## Epílogo

- En esta UT vimos:
  - SQL como ejemplo de Lenguaje de consulta.
  - Generamos código en base y para hacer consultas.
- Terminamos el curso. ¡Muchas gracias!

<!-- .slide: data-background-color="#4d4d4d" -->
