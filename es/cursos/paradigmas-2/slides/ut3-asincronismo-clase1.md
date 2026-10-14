# Programación asincrónica

### Paradigmas de Programación 2, Ingeniería y Licenciatura en Informática, FIT - UCU - 2026

<!-- .slide: data-background-color="#ffffff" -->

---

## Javascript

- Orígenes y motivaciones.
- Características y curiosidades.

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Script para la web

- Lenguaje creado por Brendan Eich a pedido de Netscape en 1995.
  - Lenguaje de scripting asociado a las páginas HTML.
  - *"Se tiene que parecer a Java"*.
- Ha salido del navegador.
  - Serverside Javascript: Rhino, NodeJS, Deno, Bun.
  - Empaquetadores de aplicaciones como Apache Cordova y Electron.
  - Es uno de los lenguajes más populares actualmente.

---

## Lenguaje Javascript

- Scripting.
  - Interpretado sin representación binaria.
- Dinámico.
  - Función `eval`.
- Débilmente tipado.
  - Typescript no es Javascript.
- Pseudo orientado a objetos.
  - Prototipos en lugar de clases.
- Permite un estilo funcional.
  - `Array` tiene `map`, `filter` y `reduce` (aka `fold`).
  - Expresiones lambda con `function` y `=>`.

---

## Pregunta 1.1: Iguales desiguales

- ¿Cuál de las siguientes expresiones de Javascript evalúa a `false`?
  - A. `'7.3' = 7.3`
  - B. `'7.3' == 7.3`
  - C. `'7.3' === 7.3`
  - D. Ninguna de las expresiones evalúa a true.
- Contestar vía Webasignatura.

---

## OOP con prototipos

- Prototipos:
  - Los objetos en JS son *hashes*.
  - Los objetos siempre tienen un *prototipo* asociado.
    - `Object.getPrototypeOf(obj)`
  - Búsqueda de un miembro: `(obj.member)`.
  - Invocación a un método: `(obj.meth(x,y))`.
- Funciones constructoras.
  - Representan las clases.
  - Definen el prototipo: `(func.prototype)`.

---

## Pregunta 1.2: Desestructuración

- Dado el siguiente código:

```javascript
const f = ({ prop }) => `[${prop}]`;
```

- ¿Cómo evaluaría la expresión `(f({ x: 17 }))`?
  - A. `'[17]'`
  - B. `'[undefined]'`
  - C. `'[${prop}]'`
  - D. Falla con un error.
- Contestar vía Webasignatura.

---

## Pregunta 1.3: `function*` & `yield`

- Dado el siguiente código:

```javascript
function* g(n) {
  for (let i = 2; i < n; i *= i) yield i;
}
```

- ¿Cómo evaluaría la expresión `([...g(17)])`?
  - A. A una lista con un objeto `Generator`.
  - B. A la lista `[16]`.
  - C. A la lista `[2,4,16]`.
  - D. Falla con un error.
- Contestar vía Webasignatura.

---

## Asincronismo

- Definiciones.
- Problemas.
- Métodos.

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Definiciones

- *Asincronismo*: el flujo puede saltar de un punto al otro del programa, debido a eventos o interrupciones.
- *Concurrencia*: propiedad de un programa de poder ejecutar porciones de código en desorden sin afectar su resultado final.
- *Multiprogramación* (o *multitasking*): un supervisor pausa y reanuda la ejecución de distintas partes del código.
- *Paralelismo*: existen múltiples flujos de ejecución simultáneos en el mismo código.
- *Distribución*: el programa es parte de un proceso mayor que ejecuta en varias computadoras.

---

## Problemas <sup>(1)</sup>

- Recursos compartidos.
  - No determinismo en entrada y salida.
  - Conflictos en la lógica de programa.
  - Integridad de datos.

```javascript
// Imaginar dos hilos de ejecución sobre esta asignación.
x = x + 1;
```

---

## Problemas <sup>(2)</sup>

- Bifurcaciones y reuniones.
- Las abstracciones normales de los lenguajes de programación asumen un flujo sincrónico.
- Operaciones asincrónicas no se pueden representar de forma transparente.

```javascript
function initApp(){
   var jsonData = XHR.get('/rest-api');
   console.log(jsonData);
}
```

---

## Asincronismo

- Concurrencia no necesariamente paralela.
  - La ejecución puede saltar en cualquier momento a otro punto del programa.
  - Puede suceder con un único hilo de ejecución.
- Interrupciones.
  - Entrada y salida asincrónica (e.g. conexiones de red).
  - Eventos del usuario (e.g. clicks en un GUI).
  - Señales del sistema operativo (e.g. terminación).

---

## Callbacks <sup>(1)</sup>

- Funciones a llamar cuando se termine la operación asincrónica.
  - Funciones de alto orden.
  - El hilo que invoca termina.
  - El evento que marca la terminación de la operación asincrónica continúa.

```javascript
function get(url, callback){
  const req = new XMLHttpRequest();
  req.addEventListener("load", callback);
  req.open("GET", url);
  req.send();
}
```

---

## Callbacks <sup>(2)</sup>

- *Callback hell*.
  - APIs basadas en callbacks pueden volverse torpes de usar.

```javascript
function getMany(){
  get('/data1', (data1) => {
    get('/data2', (data2) => {
      get('/data3', (data3) => {
        ... /* ¿Qué pasa con los errores? */
      }); // data3
    }); // data2
  }); // data1
}
```

---

## Future values

- Representaciones de operaciones asincrónicas.
  - Aliases: *futures* (Java), *promises* (JavaScript), *tasks* (C#), *deferred* o *delayed values*.
  - Proveen un protocolo común para el manejo de *callbacks*.
- Todas las funciones asíncronas devuelven una *Promise*.
  - *Pendiente*: sin valor.
  - *Resuelta*, *resolved* o *fulfilled*: el valor es el resultado de la operación asíncrona.
  - *Rechazada* o *rejected*: el valor representa un error o excepción.
  - *Completa* o *settled*: ya sea resuelta o rechazada.

---

## Promesas con eventos

- Se registran *callbacks* a llamar cuando la promesa se complete.
- ¿Cómo se resuelve el *callback hell*?

```javascript
function get(url){
  const promise = new Promise(
    (resolve, reject) => {
      const req = new XMLHttpRequest();
      req.addEventListener("load", resolve);
      req.addEventListener("error", reject);
      req.open("GET", url);
      req.send();
    }
  );
}
```

---

## Encadenamiento de promesas

- Método `then`.
  - Utilizado para encadenar promesas.

```javascript
function getMany() {
  return get('/data1')
    .then((data1) => get('/data2'))
    .then((data2) => get('/data3'))
    .then((data3) => {
      ... /* ¿Qué pasa con los errores? */
    });
}
```

---

## Pregunta 1.4: Error en resolución

- ¿Qué debería pasar si el *callback* de resolución del método `then` arroja una excepción?
  - A. Se debe arrojar una excepción.
  - B. Se debe rechazar la promesa resultante con la excepción arrojada como razón.
  - C. Se debe llamar al *callback* de rechazo.
  - D. Todas las anteriores.
- Contestar vía Webasignatura.

---

## Pregunta 1.5: `Promise<Promise>`

- ¿Qué sucede cuando se resuelve una promesa con otra promesa?

```javascript
(new Promise(
  (resolve) => resolve(Promise.resolve(777))
))
```

- Contestar vía Webasignatura.
  - A. El valor de resolución de la primera promesa pasa a ser la segunda promesa.
  - B. Se arroja una excepción.
  - C. La primera promesa se rechaza con un error.
  - D. La primera promesa se completa con el resultado de la segunda cuando se complete.

---

## Asincronismo en el lenguaje

- `async` y `await` (ES8, Python 3, C#, etc).
- Modificador `async`.
  - Marca una función o método como asincrónica.
  - Su retorno es siempre una promesa. Un `return` resuelve dicha promesa.
  - Si se levanta una excepción, dicha promesa es rechazada.
- Expresiones `await`.
  - La expresión `(await t)` *"bloquea el hilo de ejecución actual"* hasta que la tarea `t` se completa.
  - Si la tarea falla se levanta una excepción.

---

## Notación async / await

- Las funciones se marcan con `async`:
  - Retornan una `Promise`.
  - El cuerpo puede usar expresiones `await`.
- Un `await` de una expresión asincrónica *"espera"* por la resolución o rechazo.

```javascript
async function getMany() {
  const data1 = await get('/data1');
  const data2 = await get('/data2');
  const data3 = await get('/data3');
  /* ... */
}
```
