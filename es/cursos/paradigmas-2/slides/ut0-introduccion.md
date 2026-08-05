# Introducción al curso

### Paradigmas de Programación 2, Ingeniería y Licenciatura en Informática, FIT - UCU - 2026

<!-- .slide: data-background-color="#ffffff" -->

---

## Operativa del curso

- Cronograma
- Metodología
- Calificación

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Requerimientos

Para cursar de manera exitosa, el estudiante previamente debería ser capaz de:

- *Programar* de manera rudimentaria en (al menos) un lenguaje de programación.
- Diseñar *estructuras de datos* arborescentes y algoritmos que las utilicen.
- *Comunicarse efectivamente* a través de herramientas de mensajería y videoconferencia en línea.

En todas las clases se necesitará de una computadora personal.

---

## Objetivos de aprendizaje

De completar los cursos de manera exitosa, el estudiante debería ser capaz de:

- Interpretar, evaluar y construir *algoritmos y programas* en el contexto restringido de los *paradigmas* vistos en el curso.
- Identificar y describir los *aspectos y construcciones clave* de los paradigmas de programación vistos en el curso.
- Construir una *representación para una expresión* dada en un lenguaje de programación.
- Construir un *intérprete* o un *compilador* para un lenguaje de programación simple.

---

## Cronograma

- **UT0 Introducción al curso**: 6 de agosto.
- **UT1 Programación funcional**: 13 al 27 de agosto.
- **UT2 Generación de código**: 3 al 17 de setiembre.
- **UT3 Programación asincrónica**: 24 de setiembre al 15 de octubre.
- **UT4 Interpretación abstracta y transformaciones de código**: 22 de octubre al 5 de noviembre.
- **UT5 Lenguajes de consulta**: 12 al 19 de noviembre.
- **Cierre del curso**: 26 de noviembre.

---

## Curso

- Calificación final:
  - **25%** de cuestionarios de preparación (RAT) individual.
  - **5%** de cuestionarios de preparación (RAT) en equipos.
  - **35%** en trabajos de aplicación realizados en equipo.
  - **35%** en pruebas individuales al final de cada unidad temática.
- _**Todas las calificaciones grupales se ponderan por la asistencia**_.
- Aprobación directa sin examen.

---

## Trabajo en equipos

- 💡 **Metodología TBL**.
  - RAT al inicio de cada UT.
  - Trabajo en equipos en clase.
- 🌎 **Webasignatura**
  - Material de referencia.
  - Entregas.
- 💬 **Discord**
  - Interacción del equipo.
  - Consultas en privado al docente.
- 💻 **Github**
  - Sincronizar código.
  - _Portafolio TAs_.

---

## Software y hardware

- Fuera del salón de clase:
  - *Discord* para ambiente de equipo.
  - *Webasignatura* para todo lo demás.
  - *Git* para trabajo en equipo distribuido y concurrente.
- Dentro del salón de clase:
  - Laptop listo antes de entrar.
    - Batería cargada.
    - Sistema operativo actualizado.
  - Editor de texto apropiado para programar.
    - *VS Code*, *Atom*, *Notepad++*, *Brackets* o *Sublime*.
    - Ni *Notepad* ni *Vim* son apropiados.

---

## Lenguajes de programación

- Programación funcional:
  - Haskell (GHC 9.2+)
- Generación de código:
  - CIL de .NET
- Programación asincrónica:
  - JavaScript (NodeJS 18+, ES2021+)
- Lenguajes de consulta:
  - SQL

---

## Bases de la temática

- Lenguaje de programación
- Sintaxis y semántica
- Paradigmas de programación

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Lenguaje de programación

- *Notación más o menos formal que define cuáles son programas válidos, y cómo estos deben ejecutar*.
  - **Sintaxis**: cómo se escriben y organizan las construcciones del lenguaje.
    - *Formato del código*: textual vs visual.
  - **Semántica**: cómo los programas y sus operaciones ejecutan.
    - *Dominio*: general vs específico.
    - *Sistema de tipos*: fuerte vs débil.
  - **Praxis**: convenciones y estándares de codificación.
  - *Plataforma*: RTL, plataformas y ambientes de ejecución.
    - *Procesamiento del código*: interpretado vs compilado.

---

## Paradigmas de programación

- Agrupaciones de lenguajes con *modelos semánticos* similares.
  - *Modelo semántico*: operaciones provistas por el lenguaje y cómo éstas se pueden combinar.
- Ejemplos:
  - *Programación imperativa*: variables, asignaciones, secuencia, condicional (`if`), iteración (`while`, `for`), *etc*.
  - *Programación orientada a objetos*: objetos, clases, propiedades, métodos, interfaces, herencia, *etc*.
  - *Programación funcional*: funciones de alto orden, recursividad, encaje de patrones, *etc*.

---

## Quicksort .js

```javascript
function qsort(list) {
  const [pivot, ...rest] = list;
  const lesser = [];
  const greater = [];
  for (const x of rest) {
    if (x < pivot) {
      lesser.push(x);
    } else {
      greater.push(x);
    }
  }
  return [
    ...qsort(lesser),
    pivot,
    ...qsort(greater)
  ];
};
```

---

## Quicksort .hs

```haskell
qsort :: Ord a => [a] -> [a]
qsort [] = []
qsort (p:xs) = (qsort lesser) ++ p:(qsort greater)
  where
    lesser  = filter (< p) xs
    greater = filter (>= p) xs
```

---

## Categorías sintácticas

- **Expresiones**: toman datos y generan datos.
  - `1 + 2 * 3`
  - `list.map(lambda x: x * x)`
- **Sentencias**: estado y/o control del flujo de programa.
  - `int x = 12;`
  - `return null;`
  - `while (x < 0) if (x < 0) x = -x;`
- **Declaraciones**: organizan y dan forma al código.
  - `class MyObject { ... }`
  - `type MyNumber = number | null;`
  - `export default const id = (x) => x;`

---

## Representación de código

- Estructura de datos para contener la información relevante en el código fuente.
  - Lineal: *ensamblador*.
  - Arborescente: *árbol de sintaxis abstracta* o *AST*.
  - Grafo.
- *Metaprogramas*: programas que tienen como entrada y/o como salida código.
  - Intérpretes.
  - Compiladores.
  - Otros…

---

## Árbol de expresión

`if (x < 0) x = -x;`

```text
              if
            /    \
           <      =
          / \    / \
         x   0  x   -
                    |
                    x
```

---

## Sintaxis abstracta.js

```javascript
{
  type: "IfStatement",
  test: {
    type: "BinaryExpression",
    operator: "<",
    left: { type: "Identifier", name: "x" },
    right: { type: "NumericLiteral", value: 0 },
  },
  consequent: {
    type: "ExpressionStatement",
    expression: {
      type: "AssignmentExpression",
      operator: "=",
      left: { type: "Identifier", name: "x" },
      right: {
        type: "UnaryExpression",
        operator: "-",
        argument: { type: "Identifier", name: "x" },
      }
    }
  },
  alternate: null
}
```

---

## Ejercicio 1.1: Collatz

- El proceso de *Collatz* toma un número positivo *n*:
  - Si es par, lo divide entre 2.
  - Si es impar, lo multiplica por 3 y le suma 1.
- La función de *Collatz* aplica ese proceso sucesivamente hasta obtener 1, y retorna la cantidad de iteraciones.
- Implementar en Python o Javascript la función `collatz`, de dos maneras:
  - una *iterativa*,
  - otra *recursiva*, y sin usar asignaciones de variables.

---

## Propuesta 1.1: Collatz iterativo

- Implementar en Python o Javascript la función `collatz`, de dos maneras:
  - una *iterativa*,

```javascript
function collatz(n) {
  let i = 0;
  while (n > 1) {
    n = n % 2 ? 3 * n + 1 : n / 2;
    i++;
  }
  return i;
}
```

- ¿Es correcto? ¿Puede hacerse mejor?

---

## Propuesta 1.1: Collatz recursivo

- Implementar en Python o Javascript la función `collatz`, de dos maneras:
  - otra *recursiva*, y sin usar asignaciones de variables.

```javascript
function collatz(n) {
  if (n > 0) {
    return 1 + collatz(
      n % 2 ? 3 * n + 1 : n / 2
    );
  }
  return 0;
}
```

- ¿Es correcto? ¿Puede hacerse mejor?

---

## Ejercicio 1.2: treeMin

- Se desea una función que tome listas anidadas de números, y calcule su mínimo valor.
  - `treeMin([1,7,[-1]]) = -1`
  - `treeMin([[[0],1],2]) = 0`
  - `treeMin([]) = +Infinity`
  - `treeMin([[],[[]],999]) = 999`
- Implementar en Python o Javascript la función `treeMin`, de dos maneras:
  - una *recursiva*, y sin usar asignaciones de variables,
  - otra *iterativa*, y sin usar recursión.

---

## Propuesta 1.2: treeMin recursivo

- Implementar en Python o Javascript la función `treeMin`, de dos maneras:
  - una *recursiva*, y sin usar asignaciones de variables,

```javascript
function treeMin(tree) {
  if (Array.isArray(tree)) {
    const [head, ...tail] = tree;
    return Math.min(treeMin(head), treeMin(tail));
  } else {
    return +(tree ?? Infinity);
  }
}
```

---

## Propuesta 1.2: treeMin iterativo

- Implementar en Python o Javascript la función `treeMin`, de dos maneras:
  - otra *iterativa*, y sin usar recursión.

```javascript
function treeMin(tree) {
  let pending = [tree];
  let min = +Infinity;
  while (pending.length) {
    const current = pending.pop();
    if (Array.isArray(current)) {
      pending = pending.concat(current);
    } else {
      min = Math.min(current ?? Infinity, min);
    }
  }
  return min;
}
```

---

## Fin

- Próxima clase:
  - RAT1 Programación funcional.
  - Aprender o repasar *Haskell*.
  - Venir a la clase con *Glasgow Haskell Compiler* instalado y funcionando.

<!-- .slide: data-background-color="#4d4d4d" -->
