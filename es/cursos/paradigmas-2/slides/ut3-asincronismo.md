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

---

## Pregunta 2.1: Promesa de promesa

```javascript
function fn(promise) {
  return new Promise((res, rej) => {
    promise.then(res, rej);
  })
}
```

- ¿Qué resultado tiene la función `fn` antes declarada?
  - A. `undefined`, porque la función ejecutora no retorna ningún valor.
  - B. Retorna una nueva promesa equivalente a `promise`.
  - C. Retorna una nueva promesa que resuelve a la función `res`.
  - D. El código dado no funciona.
- Contestar vía Webasignatura.

---

## Ejercicio 2.2: `delay`

- Implementar en Javascript la función `delay`.
  - Dada una cantidad de milisegundos, construye una promesa que se resuelve pasado ese tiempo.
  - La resolución será el segundo argumento, o la hora actual por defecto.
  - *Nota*: usar `setTimeout` y `Date.now`.

```javascript
> await delay(1500)
1695772278502 // Hora actual luego de un segundo y medio.
> await delay(500, 'now')
"now" // luego de medio segundo.
```

---

## Propuesta 2.2: `delay`

- Implementar en Javascript la función `delay`.

```javascript
const delay = (msecs, value = undefined) => {
  return new Promise((resolve) => {
    if (typeof value === 'undefined') {
       value = Date.now();
    }
    setTimeout(() => resolve(value), msecs);
  });
};
```

- ¿Es correcta esta solución?
- ¿Qué limitaciones tiene esta solución?

---

## Ejercicio 2.3: `waitFor`

- Implementar en Javascript la función `waitFor`.
  - Recibe una promesa y una cantidad de milisegundos.
  - Si la promesa dada termina antes del tiempo dado, se retorna el mismo resultado.
  - Sino se rechaza el resultado con un error.

```javascript
> await waitFor(delay(100), 200);
1695772278502 // Hora actual luego de 100ms.
> await waitFor(delay(200), 100);
Uncaught Error: Timeout after 100ms! // Falla luego de 100ms.
```

---

## Propuesta 2.3: `waitFor`

- Implementar en Javascript la función `waitFor`.

```javascript
const waitFor = (promise, time) => {
  return new Promise((res, rej) => {
    promise.then(res, rej);
    delay(time).then(
      () => rej(new Error(`Timeout after ${time}ms!`))
    );
  });
};
```

- ¿Es correcta esta solución? ¿Es mejorable?

---

## Ejercicio 2.4: `retry`

- Implementar en Javascript la función asíncrona `retry`.
  - Recibe dos funciones: una asíncrona `valueFn` y otra síncrona `retryFn`.
  - Si el resultado de `valueFn` resuelve, se retorna eso.
  - Si falla se llama a `retryFn` con el número de reintento y el tiempo transcurrido:
    - Si retorna un número positivo, se espera ese tiempo y se reintenta.
    - Sino, se retorna el rechazo del resultado de `valueFn`.
- Este ejercicio se entregará.
  - Definir al menos 10 casos de prueba.

---

## Paralelismo

- Procesos.
- Hilos o *threads*.
- Automático o transparente.

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Paralelismo

- Múltiples ejecuciones de código al mismo tiempo.
  - *Multiprogramación*: un procesador con tiempo compartido.
  - *Multicore*: múltiples procesadores en la misma computadora.
  - *Distribuido*: múltiples procesadores en varias computadoras.
- Recursos compartidos.
  - Un proceso paralelizado comparte algo de información entre sus hilos.
  - Las fronteras entre ejecuciones facilitan la concurrencia pero dificultan la optimización.

---

## Threads

- Ejecuciones paralelas en el mismo ambiente con recursos compartidos.
- *Secciones críticas*: no puede ejecutarse más de un hilo.
  - Exclusión mutua o *mutex* explícita usando locks (semáforos, monitores, `synchronized` en Java).
  - *Deadlock*: hilos trancados mutuamente, esperando uno por el otro.
  - *Condiciones de carrera*: la correctitud del código depende de un orden no forzado.
  - *Inanición* o *falta de progreso*: cuando un hilo siempre llega tarde a obtener un recurso que necesita.

---

## Procesos

- Ejecuciones paralelas con ambientes separados e interacciones controladas.
  - Separación e interacciones controladas por el sistema operativo o ambiente de ejecución.
  - *Marshalling* o serialización para transmisión entre procesos por canales provistos.
- Comunicación entre procesos.
  - Sistemas de archivos o *pipes*.
  - Señales del sistema operativo.
  - *Sockets* o conexiones de red ficticias.
- Colas de mensajes o *mailboxes*.

---

## Paralelismo transparente

- El entorno de ejecución o compilador paraleliza automáticamente.
- Operaciones referencialmente transparentes pueden paralelizarse con mínima sincronización.
  - Haskell (GHC): módulo `Control.Parallel` permite paralelizar todo el código que no maneje IO.
  - Colisiones con la evaluación perezosa.
- Usualmente se tratan bucles que recorren vectores o matrices.
  - GPUs: lenguajes de *shaders* y CUDA.
  - Autoparalelización y autovectorización (e.g. `/Qpar` en C#).

---

## Webworkers

- Paralelismo en el navegador web.
  - *Rendering thread*: el hilo de ejecución que tiene acceso al DOM.
  - *Webworkers*: otros hilos de ejecución, creados por el código del *rendering thread*.
  - Comunicación similar a `iframes`, asincrónica mediante mensajes y eventos.
- `const worker = new Worker(scriptURL);`
  - `worker.onmessage = (event) => console.log(event.data);`
  - `worker.postMessage('Hello worker!');`
  - `worker.terminate();`

---

## Ejemplo 2.5: Webworkers bench <sup>(1)</sup>

- Instalar el código de referencia de Webasignatura.
  - Instalar dependencias con `npm i`.
  - Levantar con `npm start`.
  - Probar función `echoWorker`.

```javascript
const worker1 = echoWorker();
worker1.postMessage('Echoooo');
```

```javascript
const worker2 = tickWorker();
// Deberían aparecer mensajes en la consola.
worker2.terminate();
```

- ¿Funciona? ¿Cómo?

---

## Ejemplo 2.5: Webworkers bench <sup>(2)</sup>

- La función `workerFunction` construye una versión paralela (y por ende, asíncrona) de otra función.

```javascript
workerFunction((x, y) => x ** y)(2, 11).then(console.log);
```

- Revisar el código de la misma.
  - ¿Es correcta la implementación?
  - ¿Se puede mejorar?

---

## Epílogo

- En esta UT vimos:
  - Javascript y sus promesas.
  - Paralelismo en el navegador con web workers.
- Próxima clase:
  - Interpretación abstracta.
  - Transformaciones de código.

<!-- .slide: data-background-color="#4d4d4d" -->
