# Generación de código

### Paradigmas de Programación 2, Ingeniería y Licenciatura en Informática, FIT - UCU - 2026

<!-- .slide: data-background-color="#ffffff" -->

---

## Generación de código

- Representación de código
- Máquina AM
  - Compilación de While
- MSIL
  - Ingeniería reversa de compilación de C#.
  - Generación de código IL.

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Lenguaje While

- Expresiones aritméticas:
  - Numerales, sumas, restas y multiplicaciones.
- Expresiones booleanas:
  - Comparaciones por igual y menor o igual.
  - Literales booleanos, negaciones y conjunciones.
- Sentencias:
  - Asignaciones de variables numéricas.
  - Secuencias y bloques.
  - Sentencia nula (`skip`).
  - Condicional (`if`).
  - Iteración (`while`).

---

## Ejemplo 1.1: data AExp

- Tipo `data` para el AST de While en Haskell:

```haskell
data AExp = Num Int | Var String
          | Add AExp AExp | Sub AExp AExp
          | Mult AExp AExp deriving (Eq, Show)
```

- Ejemplos:

```haskell
zero = Num 0
one = Num 1
minusOne = Sub zero one
varX = Var "x"
xPlus1 = Add (Var "x") one
onePlusTwoTimesThree = Add (Num 1) (Mult (Num 2) (Num 3))
```

---

## Ejercicio 1.2: data BExp and Stmt

- Definir tipos `data` en Haskell para expresiones booleanas y sentencias de While.
- Definir constantes para los siguientes ejemplos:

```text
1: { x = 77; y = x * x; }
2: {
  x = -32;
  if !(0 <= x) then x = 0 - x; else skip;
}
3: {
  n = 5; f = 1;
  while 1 <= n do {
    f = f * n; n = n - 1;
  }
}
```

---

## Propuesta 1.2: data BExp and Stmt (1)

- Definir tipos `data` en Haskell para expresiones booleanas y sentencias de While.

```haskell
data AExp = Num Int | Var String
          | Add AExp AExp | Sub AExp AExp
          | Mult AExp AExp deriving (Eq, Show)
data BExp = BoolLit Bool 
          | CompEq AExp AExp | CompLtEq AExp AExp
          | Neg BExp | And BExp BExp deriving (Eq, Show)
data Stmt = Assign String AExp
          | Seq [Stmt]
          | IfThenElse BExp Stmt Stmt
          | WhileDo BExp Stmt deriving (Eq, Show)
skip = Seq []
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Propuesta 1.2: data BExp and Stmt (2)

- Definir constantes para los siguientes ejemplos:

```haskell
varX = Var "x"
varN = Var "n"
zero = Num 0
one = Num 1

example1 = Seq [Assign "x" (Num 77), Assign "y" (Mult varX varX)]
example2 = Seq [Assign "x" (Num (-32)), IfThenElse
  (Neg (CompLtEq zero varX)) (Assign "x" (Sub zero varX)) (Seq [])]
example3 = Seq [
  Assign "n" (Num 5), Assign "f" one, WhileDo (CompLtEq one varN)
  (Seq [
    Assign "f" (Mult (Var "f") varN), Assign "n" (Sub varN one)
  ])]
```

---

## Ejemplo 1.3: Evaluando AExp

- Implementación del estado de While:
  - `type State = [(String, Int)]`
- Función semántica para `AExp` en Haskell:

```haskell
evalAExp :: AExp -> State -> Int
evalAExp (Num n) _ = n
evalAExp (Var x) s = let (Just v) = (lookup x s) in v
evalAExp (Add a1 a2) s = (evalAExp a1 s) + (evalAExp a2 s)
evalAExp (Sub a1 a2) s = (evalAExp a1 s) - (evalAExp a2 s)
evalAExp (Mult a1 a2) s = (evalAExp a1 s) * (evalAExp a2 s)
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejercicio 1.4: Evaluando BExp and Stmt

- Implementar en Haskell las funciones semánticas de While.
  - Evaluar `BExp` and `Stmt`.
- Función para modificar un valor en el estado:

```haskell
updateState :: String -> Int -> State -> State
updateState x v s = (x, v):(filter (\(y, _) -> x /= y) s)
```

---

## Propuesta 1.4: Evaluando BExp

- Función semántica para `BExp` en Haskell:

```haskell
evalBExp :: BExp -> State -> Bool
evalBExp (BoolLit b) _ = b
evalBExp (CompEq a1 a2) s = (evalAExp a1 s) == (evalAExp a2 s)
evalBExp (CompLtEq a1 a2) s = (evalAExp a1 s) <= (evalAExp a2 s)
evalBExp (Neg b1) s = not (evalBExp b1 s)
evalBExp (And b1 b2) s = (evalBExp b1 s) && (evalBExp b2 s)
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Propuesta 1.4: Evaluando Stmt

- Función semántica para `Stmt` en Haskell:

```haskell
evalStmt :: Stmt -> State -> State
evalStmt (Assign x a) s = (x, v):(filter (\(y, _) -> x /= y) s)
  where v = evalAExp a s
evalStmt (Seq stmts) s = foldl (\s stmt -> evalStmt stmt s) s stmts
evalStmt (IfThenElse b s1 s2) s = evalStmt (
  if (evalBExp b s) then s1 else s2) s
evalStmt (WhileDo b s1) s = if (evalBExp b s) then (
  evalStmt (WhileDo b (evalStmt s1 s))) else s
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Generación de código

- Es el proceso de producir código objeto a partir de código fuente.
  - AST código fuente ⇒ AST código objeto.
  - AST código fuente ⇒ código objeto directamente.
- Código fuente vs código objeto puede ser:
  - De mayor nivel: *compilador*.
  - Del mismo nivel: *transpilador* 😒.
  - De menor nivel: *decompilador*.

---

## Máquina AM

- Máquina de transición de estados con pila.
  - Código objeto de la compilación de While en [NIELSEN1999].
- Configuración: ⟨c, e, s⟩
  - c: código AM siendo ejecutado,
  - e: pila de evaluación (ℤ ∪ {tt, ff})\*,
  - s: estado (Var → ℤ).

---

## Ejemplo AM (1)

- `(2+4)*3 ⇒ 2 4 + 3 *`

```text
Código:  »PUSH-2«  PUSH-4  ADD  PUSH-3  MULT  ...

Pila (tope arriba):
  (vacía)
```

---

## Ejemplo AM (2)

- `PUSH-2`

```text
Código:  PUSH-2  »PUSH-4«  ADD  PUSH-3  MULT  ...

Pila (tope arriba):
  2
```

---

## Ejemplo AM (3)

- `PUSH-4`

```text
Código:  PUSH-2  PUSH-4  »ADD«  PUSH-3  MULT  ...

Pila (tope arriba):
  4
  2
```

---

## Ejemplo AM (4)

- `ADD`: (4 + 2 = 6)

```text
Código:  PUSH-2  PUSH-4  ADD  »PUSH-3«  MULT  ...

Pila (tope arriba):
  6
```

---

## Ejemplo AM (5)

- `PUSH-3`

```text
Código:  PUSH-2  PUSH-4  ADD  PUSH-3  »MULT«  ...

Pila (tope arriba):
  3
  6
```

---

## Ejemplo AM (6)

- `MULT` (3 \* 6 = 18)

```text
Código:  PUSH-2  PUSH-4  ADD  PUSH-3  MULT  »...«

Pila (tope arriba):
  18
```

---

## Código objeto de bajo nivel

- Tipos de memoria.
  - Estática o constante.
  - Pila de ejecución o stack.
  - Memoria dinámica o heap.
- Evaluación.
  - Usando registros (código nativo).
  - Usando pila de ejecución (máquinas virtuales).
- Ensamblador.
  - Representación lineal con saltos y punteros.

---

## Ejemplo IL (1)

- `(2 + 4) * 3`

```text
Código:  »ldc.i4.2«  ldc.i4.4  add  ldc.i4.3  mul  ...

Pila (tope arriba):
  (vacía)
```

---

## Ejemplo IL (2)

- `ldc.i4.2`

```text
Código:  ldc.i4.2  »ldc.i4.4«  add  ldc.i4.3  mul  ...

Pila (tope arriba):
  2
```

---

## Ejemplo IL (3)

- `ldc.i4.4`

```text
Código:  ldc.i4.2  ldc.i4.4  »add«  ldc.i4.3  mul  ...

Pila (tope arriba):
  4
  2
```

---

## Ejemplo IL (4)

- `add`: (4 + 2 = 6)

```text
Código:  ldc.i4.2  ldc.i4.4  add  »ldc.i4.3«  mul  ...

Pila (tope arriba):
  6
```

---

## Ejemplo IL (5)

- `ldc.i4.3`

```text
Código:  ldc.i4.2  ldc.i4.4  add  ldc.i4.3  »mul«  ...

Pila (tope arriba):
  3
  6
```

---

## Ejemplo IL (6)

- `mul` (3 \* 6 = 18)

```text
Código:  ldc.i4.2  ldc.i4.4  add  ldc.i4.3  mul  »...«

Pila (tope arriba):
  18
```

---

## Stack frame

```text
┌──────────────────────────┐
│ ← Tope del stack frame   │
├──────────────────────────┤
│ Pila de evaluación       │
├──────────────────────────┤
│ Variables locales        │
├──────────────────────────┤
│ Parámetros               │
├──────────────────────────┤
│ Dirección de retorno     │
├──────────────────────────┤
│ Valor de retorno         │
├──────────────────────────┤
│ ← Inicio del stack frame │
├──────────────────────────┤
│ ...                      │
└──────────────────────────┘
```

---

## Código lineal y secuencial

- Instrucciones ubicadas en una posición de memoria.
  - Registro PC o IP apunta a la instrucción actual.
- Para romper la secuencialidad se usan saltos y punteros.
  - Salto incondicional:
    - `br T` ⇒ PC ← T
  - Salto condicional:
    - `br.true T` ⇒ si tope(pila) ≠ 0 ⇒ `br T`
  - Salto condicional abreviadas:
    - `beq T` ⇒ `ceq ; brtrue T`
  - Otros, e.g. indexados.

---

## Condicional if-then-else

- `if (b) S₁ else S₂`

```text
      (b)
      br.true T1
      (S2)
      br T2
T1:   (S1)
T2:   ...
```

---

## Condicional if-then

- `if (b) then S`

```text
      (b)
      br.false T1
      (S1)
T1:   ...
```

---

## Iteración while-do

- `while (b) S`

```text
T1:   (b)
      br.false T2
      (S)
      br T1
T2:   ...
```

---

## Preparación

- Retroingeniería de `csc.exe`: el compilador de C# para CIL.
  - Usar `csc`, `ildasm` e `ilasm` del SDK de MS .Net.
  - Compilar código C# de prueba.
  - Desensamblar el *assembly* resultante.
  - Inspeccionar el código IL desensamblado.
- 🚨 Cuidado con:
  - Código modificado por el optimizador.
  - Abreviaciones, e.g. `ldc.i4.0` ~ `ldc.i4 0`.

---

## Ejercicio 2.1

- Compilar y desensamblar el siguiente código C#:

```csharp
class RetroEng {
  static void Main(string[] args) {
    int x = 0, y = 0; bool b = false;
    x = 73; // Code to change.
    System.Console.WriteLine("x={0}, y={1}, b={2}", x, y, b);
  }
}
```

- Modificar en código IL resultante el `73` por `91`.
- Ensamblar y verificar que código modificado ejecuta.

---

## Ejemplo 2.2: .locals

- Obtener la lista de variables de un código While:

```haskell
import Data.List (nub)

ilLocals :: Stmt -> [String]
ilLocals (Assign x _) = [x]
ilLocals (Seq stmts) = nub (concat (map ilLocals stmts))
ilLocals (IfThenElse b s1 s2) = nub (concat (map ilLocals [s1, s2]))
ilLocals (WhileDo b s) = ilLocals s
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Pregunta 2.3: Compilación a IL

- Dada la siguiente expresión de While:
  - `x = 1 + 2;`
- ¿Cómo debería compilarse a CIL?
  - A. `ldc.i4.1 ldc.i4.2 add`
  - B. `ldc.i4.2 ldc.i4.1 add`
  - C. `ldc.i4.1 ldc.i4.2 add stloc.0`
  - D. `ldc.i4.2 ldc.i4.1 add stloc.0`
  - E. Ninguna de las propuestas es correcta.
- Contestar vía Webasignatura.

---

## Ejercicio 2.4: .maxstack

- Obtener el máximo consumo de pila de un código While:

```haskell
ilMaxStackAExp :: AExp -> Int
ilMaxStackAExp (Num _) = 1
ilMaxStackAExp (Var _) = 1
ilMaxStackAExp (Add a1 a2) =
  max (ilMaxStackAExp a1) (1 + ilMaxStackAExp a2)
ilMaxStackAExp (Mult a1 a2) =
  max (ilMaxStackAExp a1) (1 + ilMaxStackAExp a2)
ilMaxStackAExp (Sub a1 a2) =
  max (ilMaxStackAExp a1) (1 + ilMaxStackAExp a2)
```

- ¿Cómo se podría calcular para `BExp` y `Stmt`?

---

## Propuesta 2.4: .maxstack (1)

- Obtener el máximo consumo de pila de un código While:

```haskell
ilMaxStackBExp :: BExp -> Int
ilMaxStackBExp (BoolLit _) = 1
ilMaxStackBExp (CompEq a1 a2) =
  max (ilMaxStackAExp a1) (1 + ilMaxStackAExp a2)
ilMaxStackBExp (CompLtEq a1 a2) =
  max (ilMaxStackAExp a1) (1 + ilMaxStackAExp a2)
ilMaxStackBExp (Neg b1) = ilMaxStackBExp b1
ilMaxStackBExp (And b1 b2) =
  max (ilMaxStackBExp b1) (1 + ilMaxStackBExp b2)
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Propuesta 2.4: .maxstack (2)

- Obtener el máximo consumo de pila de un código While:

```haskell
ilMaxStackStmt :: Stmt -> Int
ilMaxStackStmt (Assign x a) = ilMaxStackAExp a
ilMaxStackStmt (Seq stmts) =
  maximum (map ilMaxStackStmt stmts)
ilMaxStackStmt (IfThenElse b s1 s2) =
  maximum [ilMaxStackBExp b, ilMaxStackStmt s1, ilMaxStackStmt s2]
ilMaxStackStmt (WhileDo b s) =
  maximum [ilMaxStackBExp b, ilMaxStackStmt s]
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejemplo 2.5: Compilador While a IL

- Generación de código IL para `AExp`:

```haskell
import Data.List (elemIndex)

data CodeGenContext = CodeGenContext {
    locals :: [String],
  } deriving (Show)

ilCompileAExp :: AExp -> CodeGenContext -> [String]
ilCompileAExp (Num n) _ = ["ldc.i4 "++ (show n)]
ilCompileAExp (Var x) = ["ldloc.s "++ (show i)]
  where (Just i) = elemIndex x (locals ctx)
ilCompileAExp (Add a1 a2) ctx = 
  concat [ilCompileAExp a1 ctx, ilCompileAExp a2 ctx, ["add"]]
-- análogo para Sub y Mult
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejercicio 2.6: Compilador While a IL

- Implementar compilación de While a IL.
  - Funciones `ilCompileBExp` e `ilCompileStmt`.
  - Probar de ensamblar y ejecutar código generado.
- Temas a resolver:
  - ¿Cómo generar las etiquetas de los saltos?
  - `CodeGenContext` se puede extender como se necesite.
- ⚠️ Este ejercicio se calificará.
  - Entregar vía Webasignatura.

---

## Ejercicio 3.1: Extender While

- Agregar a la representación de código While:
  - La división (`/`) entre dos AExps.
  - La comparación por mayor o igual (`>=`) entre dos AExps.
  - La disyunción lógica (`||`) entre dos BExps.
- Ampliar las funciones del intérprete para poder evaluar los casos nuevos.
  - Verificar con el REPL que funciona correctamente.

---

## Ejemplo 3.2: Nueva sintaxis (1)

- `Lexer.x`:

```text
tokens :- 
...
  "/"        { \s -> TokenDiv }
  ">="       { \s -> TokenGtEq }
  "||"       { \s -> TokenOr }
...

data Token = ... | TokenDiv | TokenGtEq | TokenOr
```

---

## Ejemplo 3.2: Nueva sintaxis (2)

- `Parser.y`:

```text
%tokens
...
  '/'        { TokenDiv }
  '>='       { TokenGtEq }
  '||'       { TokenOr }
...
%left '||'
%left '&&'
%nonassoc '==' '<=' '>='
left '+' '-'
left '*' '/'
left '!'
...
```

---

## Ejemplo 3.2: Nueva sintaxis (3)

- `Parser.y`:

```text
...
BExp :: {BExp}
  ...
  | AExp '>=' AExp  { CompGtEq $1 $3 }
  | BExp '||' BExp  { Or $1 $3 }
...
AExp :: {AExp}
  ...
  | AExp '/' AExp  { Div $1 $3 }
...
```

---

## Ejercicio 3.3: Extender compilador

- Ampliar las funciones de compilación para contemplar las operaciones agregadas.
- Agregar al programa principal un argumento `-c` que:
  - Toma el código de la entrada estándar como siempre.
  - Compila a IL.
  - Escribe el IL en la salida estándar.
  - Termina la ejecución.
- ⚠️ Este ejercicio se calificará.
  - Entregar vía Webasignatura.

---

## Epílogo

- En esta UT vimos:
  - Definición de representación de código (AST).
  - Cálculos sobre una representación de código.
  - Generación de código (MSIL) para un lenguaje imperativo simple (While).
- Proxima clase:
  - Programación asíncrona con Javascript.

<!-- .slide: data-background-color="#4d4d4d" -->
