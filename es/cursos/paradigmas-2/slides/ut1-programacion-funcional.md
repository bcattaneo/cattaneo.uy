# Programación funcional

### Paradigmas de Programación 2, Ingeniería y Licenciatura en Informática, FIT - UCU - 2026

<!-- .slide: data-background-color="#ffffff" -->

---

## Programación funcional

- Abstracción de función
- Transparencia referencial
- Haskell.

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Abstracción de función <sup>(1)</sup>

- Organización y reutilización de código.
- Subrutinas: secciones de código reutilizable.
  - Salto guardando posición de retorno (GOSUB y RET).
  - Varias posiciones de retorno, formando una pila.
- Ámbito de la función:
  - Variables locales y argumentos.
  - Valor de retorno.
  - Llamadas recursivas y stack-frames.
  - Funciones definidas dentro de funciones.

---

## Abstracción de función <sup>(2)</sup>

- Programación funcional.
  - Objeto función con operación de llamada.
  - Clausuras sintácticas y capturas de variables.
- Evaluación parcial y generadores.
  - Retorno parcial con valor con continuación.
  - Registro de activación.
  - Interpretación del resultado como secuencia iterable.

---

## Programación funcional

- Funcional es un estilo de programación.
  - Funciones como valores, argumentos y resultados.
  - Estructuras no modificables.
  - Ningún o pocos efectos colaterales.
- Énfasis en recursividad (aunque no es obligatorio).
  - Hay lenguajes más y menos funcionales.
  - La mayoría de los lenguajes modernos permiten un estilo funcional.
  - Un enfoque genérico permite gran reutilización y menos redundancia.

---

## Haskell

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Expresiones básicas <sup>(1)</sup>

- Números:
  - `(1 + 2) (3 * 4) (5.6 - 6) (7 / 8.9)`
  - `(1 == 2) (11 /= 12)`
  - `(3 < 4) (5 <= 6) (7 > 8) (9 >= 10)`
- Valores de verdad (alias booleanos):
  - `True False (not False)`
  - `(True && False) (False || True)`

---

## Expresiones básicas <sup>(2)</sup>

- Caracteres: `'a' '\'' '\\' '\t'`
- Textos (alias Strings): `"abcd" "\"\\" "\n\t\r\b"`
  - `("<<" ++ ">>")`
  - `('a':"bcd")`
  - `(length "123")`
  - `("123" !! 1)`
- Listas: `[] [1] [1,2] [1,2,3]`
  - `[1] ++ [2,3]`
  - `(1:[2,3])`

---

## Expresiones no tan básicas <sup>(1)</sup>

- Condicional: `(if c then vt else vf)`
  - `(if True then 1 else 0)`
  - `(if x < 0 then -x else x)`
  - `(if x < 0 then -1 else if x > 0 then 1 else 0)`
- Let-in: `(let x = v1 in v2)`
  - `(let x = 3 in x * x)`
  - `(let x = 2 + 4 in let y = x * x in y * x)`

---

## Expresiones no tan básicas <sup>(2)</sup>

- Aplicaciones de funciones: `(fun arg1 arg2)`
  - `(max 1 3) (max 1 (-3))`
  - `(max (min 2 4) 3)`
  - `(div 5 3) (mod 5 3)`
- Error (implica aborción de la ejecución): `(error "mensaje")`
  - `(error "get: negative index!")`

---

## Ejercicio 1.1: inRange

- Definir la función `inRange` que determina si un valor está dentro de un rango dado.

  - `inRange 5 7 1 = False`
  - `inRange 5 7 6 = True`
  - `inRange 5 7 8 = False`
  - `inRange 5 7 5 = True`
  - `inRange 7 5 6 = False`
  - `inRange (-1) 0 2 = False`
  - `inRange (-1) 1 0 = True`

---

## Propuesta 1.1: inRange <sup>(if)</sup>

- Definir la función `inRange` que determina si un valor está dentro de un rango dado.

```haskell
inRange :: Int -> Int -> Int -> Bool
inRange left right n = if n < left then False 
  else if n > right then False else True
```

- ¿Es correcta? ¿Puede hacerse mejor?

---

## Propuesta 1.1: inRange <sup>(guardas)</sup>

- Definir la función `inRange` que determina si un valor está dentro de un rango dado.

```haskell
inRange :: Int -> Int -> Int -> Bool
inRange left right n 
  | n < left = False 
  | n > right = False 
  | otherwise = True
```

- ¿Es correcta? ¿Puede hacerse mejor?

---

## Propuesta 1.1: inRange <sup>(Bool)</sup>

- Definir la función `inRange` que determina si un valor está dentro de un rango dado.

```haskell
inRange :: Int -> Int -> Int -> Bool
inRange left right n = n >= left && n <= right
```

- ¿Es correcta? ¿Puede hacerse mejor?

---

## Funciones recursivas

La definición incluye una o más aplicaciones de lo que se está definiendo.

```text
n! = 1            si n = 0
n! = n × (n-1)!   si n >= 1
```

```haskell
factorial n = (if n == 0 then 1
  else if n >= 1 then n * (factorial (n-1))
  else error "Factorial is not defined for negative numbers!"
  )
```

---

## Ejercicio 1.2: fibonacci

- Definir la función `fibonacci`, que dado un número natural *n* retorna el enésimo número en la secuencia de Fibonacci.
  - `fibonacci 0 = 0`
  - `fibonacci 1 = 1`
  - `fibonacci 2 = 1`
  - `fibonacci 3 = 2`
  - `fibonacci 5 = 5`
  - `fibonacci 7 = 13`
  - `fibonacci 10 = 55`
  - `fibonacci (-1) = error!`

---

## Propuesta 1.2: fibonacci <sup>(1)</sup>

- Definir la función `fibonacci`, que dado un número natural *n* retorna el enésimo número en la secuencia de Fibonacci.

```haskell
fibonacci :: Int -> Int
fibonacci n
  | n < 0 = error "Negative!"
  | n < 2 = n
  | otherwise = (fibonacci (n - 1)) + (fibonacci (n - 2))
```

- ¿Es correcta? ¿Puede hacerse mejor?

---

## Propuesta 1.2: fibonacci <sup>(2)</sup>

- Definir la función `fibonacci`, que dado un número natural *n* retorna el enésimo número en la secuencia de Fibonacci.

```haskell
fibonacci :: Int -> Int
fibonacci n
  | n < 0 = error "Negative!"
  | otherwise = _fibonacci n 1 0

_fibonacci :: Int -> Int -> Int -> Int
_fibonacci 0 _ n_2 = n_2
_fibonacci 1 n_1 _ = n_1
_fibonacci i n_1 n_2
  | i > 1 = _fibonacci (i - 1) (n_1 + n_2) n_1
```

- ¿Es correcta? ¿Puede hacerse mejor?

---

## Encaje de patrones

- Una tupla se desarma en todos sus componentes.
  - `suma2 (a, b) = a + b`
  - `suma3 (a, b, c) = a + b + c`
- Una lista se desarma en cabeza y cola.
  - `sumaN (x:xs) = x + (sumaN xs)`
  - `sumaN [] = 0`
- Los patrones se pueden anidar también.
  - `sumaP ((a,b):ps) = (a+b):(sumaP ps)`
  - `sumaP [] = []`

---

## Operaciones con listas <sup>(1)</sup>

- Largo:
  - `length :: [a] -> Int`
    - `length [1,2,3,4] = 4`
- Concatenación:
  - `(:) :: a -> [a] -> [a]`
    - `7:[] = [7]`
    - `1:2:3:[] = [1,2,3]`
  - `(++) :: [a] -> [a] -> [a]`
    - `[1,2] ++ [3] = [1,2,3]`

---

## Operaciones con listas <sup>(2)</sup>

- Indización:
  - `(!!) :: [a] -> Int -> a`
    - `[1,2,3] !! 0 = 1`
  - `head :: [a] -> a`
    - `head [1,2,3] = 1`
    - `head [] = error "Prelude.head: empty list"`
  - `tail :: [a] -> [a]`
    - `tail [1,2,3] = [2,3]`
    - `tail "a" = ""`

---

## Operaciones con listas <sup>(3)</sup>

- Enumeraciones:
  - `[0..5] = [0,1,2,3,4,5]`
  - `[0,2..7] = [0,2,4,6]`
- Por comprensión.
  - `[x | x <- [0..7], mod x 2 == 0]`
  - `[(x,y) | x <- [0,1], y <- "xy"]`
  - `[(x,y) | x <- [0..5], y <- [x..5]]`

---

## Ejercicio 1.3: setElemAt

- Definir la función `setElemAt` que toma una lista, un elemento y una posición, y retorna una nueva lista igual a la dada, salvo que tiene el valor dado en la posición dada.
  - `setElemAt [1,2,3] 77 1 = [1,77,3]`
  - `setElemAt "abcdef" 'x' 0 = "xbcdef"`
  - `setElemAt "abcdef" 'x' 2 = "abxdef"`
  - `setElemAt "abcdef" 'x' 5 = "abcdex"`
  - `setElemAt [0,1,2,3] 1 (-1) = [0,-1,2,3]`
  - `setElemAt [] True 0 = [True]`
  - `setElemAt [] True 1 = error "!"`
  - `setElemAt [False,True] False 3 = error "!"`

---

## Propuesta 1.3: setElemAt

- Definir la función `setElemAt` que toma una lista, un elemento y una posición, y retorna una nueva lista igual a la dada, salvo que tiene el valor dado en la posición dada.

```haskell
setElemAt :: [a] -> a -> Int -> [a]
setElemAt _ _ i | i < 0 = error ("Invalid index "++ (show i) ++"!")
setElemAt xs y 0 = y:xs
setElemAt [] _ i = error ("Invalid index "++ (show i) ++"!")
setElemAt (x:xs) y i = x:(setElemAt xs y (i - 1))
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejercicio 1.4: oneHot

- Definir la función `oneHot`, que toma un largo *n* y un índice *i*.
- Retorna una lista de largo *n* con todos sus elementos en `0`, salvo un `1` en la posición *i* (si existe).
  - `oneHot 0 0 = []`
  - `oneHot 3 0 = [1, 0, 0]`
  - `oneHot 4 2 = [0, 0, 1, 0]`
  - `oneHot (-1) 2 = error!`
  - `oneHot 2 (-1) = [0, 0]`
  - `oneHot 5 7 = [0, 0, 0, 0, 0]`

---

## Propuesta 1.4: oneHot

- Definir la función `oneHot`, que toma un largo *n* y un índice *i*.

```haskell
oneHot :: Int -> Int -> [Int]
oneHot n _ | n < 0 = error "Negative length!"
oneHot 0 _ = []
oneHot n i = (if i == 0 then 1 else 0):(oneHot (n - 1) (i - 1))
```

- ¿Es correcta? ¿Puede hacerse mejor?

---

## Funciones como datos

- Funciones de alto orden:
  - En argumentos y resultados.
  - Gran mecanismo de reutilización: permite definir y parametrizar algoritmos muy genéricos.
- ¿Qué tienen en común todas estas funciones?

```haskell
plus1 [] = []
plus1 (n:ns) = (n + 1):(plus1 ns)

squares [] = []
squares (n:ns) = (n * n):(squares ns)

firsts [] = []
firsts ((x, _):ps) = x:(firsts ps)
```

---

## Definiciones concisas

- Expresiones *lambda*.
  - Definir funciones *ad-hoc*, anónimas, en el lugar.
  - Equivalentes a definiciones *“normales”*.
- Aplicación parcial o *currying*.
  - Firmas :: `a -> b -> c -> d`.
  - Permite definir funciones más brevemente.
  - Equivalentes a definiciones *“normales”* y lambdas.

---

## Funciones genéricas: `map`

- Transformar datos en listas.
  - `map :: (a -> b) -> [a] -> [b]`

```haskell
-- plus1 [] = []
-- plus1 (n:ns) = (n + 1):(plus1 ns)
plus1 ns = map (+ 1) ns
```

```haskell
-- squares [] = []
-- squares (n:ns) = (n * n):(squares ns)
squares ns = map (\n -> n * n) ns
```

```haskell
-- firsts [] = []
-- firsts ((x, _):ps) = x:(firsts ps)
firsts ps = map (\(x, _) -> x) ps
```

---

## Funciones genéricas: `filter`

- Seleccionar datos en listas.
  - `filter :: (a -> Bool) -> [a] -> [a]`

```haskell
-- negatives [] = []
-- negatives (n:ns)
--   | n < 0 = n:(negatives ns)
--   | otherwise = negatives ns
negatives ns = filter (< 0) ns
```

```haskell
-- nonEmpty [] = []
-- nonEmpty (l:ls) = if (len l) < 1 then nonEmpty ls
--   else l:(nonEmpty ls)
nonEmpty ls = filter (\l -> (len l) > 0) ls
```

---

## Funciones genéricas: `foldl` & `foldr`.

- Agregar datos en listas, con diferentes asociatividades.
  - `foldl :: (b -> a -> b) -> b -> [a] -> b`
  - `foldr :: (a -> b -> b) -> b -> [a] -> b`

```haskell
-- sum [] = 0
-- sum (n:ns) = n + (sum ns)
sum ns = foldl (+) 0 ns
```

- Variantes
  - `foldl (-) 0 [1,2,4] = (((0-1)-2)-4) = -7`.
  - `foldl1 (-) [1,2,4] = ((1-2)-4) = -5`.
  - `foldr (-) 0 [1,2,4] = (1-(2-(4-0))) = 3`.

---

## Otras funciones genéricas.

- `scanr` & `scanl`:
  - `scanl (+) 0 [1..5] = [0,1,3,6,10,15]`
  - `scanr (+) 1 [2,3,4] = [10,8,5,1]`
- `takeWhile` & `dropWhile`:
  - `takeWhile isDigit "123abc456" = "123"`
  - `dropWhile (< 5) [0..8] = [5,6,7,8]`
- `zipWith`:
  - `zipWith (+) [1,2] [3,4,5] = [4,6]`
  - `zipWith max "c4F3" "???" = "c?F"`
- Y hay más.

---

## Ejercicio 2.1: allEqual

- Definir la función `allEqual`:
  - Toma una lista de valores comparables por igual.
  - Retorna si todos los valores son iguales.
- Por ejemplo:
  - `allEqual [1, 1] = True`
  - `allEqual [1, 2] = False`
  - `allEqual [1 + 2, 3] = True`
  - `allEqual [1] = error!`
  - `allEqual [] = error!`

---

## Propuesta 2.1: allEqual

- Definir la función `allEqual`:
  - Toma una lista de valores comparables por igual.
  - Retorna si todos los valores son iguales.

```haskell
allEqual :: (Eq a) => [a] -> Bool
allEqual (v0:vs) = not (null (filter (== v0) vs))
allEqual _ = error "Need two or more values to compare!"
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Propuesta 2.1: allEqual <sup>(2)</sup>

- Definir la función `allEqual`:
  - Toma una lista de valores comparables por igual.
  - Retorna si todos los valores son iguales.

```haskell
allEqual :: (Eq a) => [a] -> Bool
allEqual (v0:vs) = and [v0 == v | v <- vs]
allEqual _ = error "Need two or more values to compare!"
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejercicio 2.2: isSorted

- Implementar la función `isSorted` que verifica si los elementos de una lista están ordenados (de manera ascendente).
  - Al menos una solución debe usar funciones de alto orden.
- Por ejemplo:
  - `isSorted "abcd" = True`
  - `isSorted "dcba" = False`
  - `isSorted [1,3,2] = False`
  - `isSorted "xxx" = True`
  - `isSorted [1.2] = True`
  - `isSorted [] = True`

---

## Propuesta 2.2: isSorted

- Implementar la función `isSorted` que verifica si los elementos de una lista están ordenados (de manera ascendente).

```haskell
isSorted :: (Ord a) => [a] -> Bool
isSorted [] = True
isSorted xs@(_:ys) = and (zipWith (<=) xs ys)
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejercicio 2.3: bests

- Definir la función `bests`, que dada una función de evaluación (`a -> Double`) y una lista.
- Retorna los elementos con máxima evaluación.
  - `bests abs [-7.0..5.0] = [-7.0]`
  - `bests fromIntegral [0..10] = [10.0]`
  - `bests snd [('a',1.0), ('b',2.2)] = [('b',2.2)]`
  - `bests pmax [(1.0,1.0), (0.0,3.0)] = [(0.0,3.0)]`
    - `where pmax (x, y) = max x y`
  - `bests pmin [] = []`
    - `where pmin (x, y) = min x y`
- Usar funciones de alto orden: `map`, `filter`, `foldr`, etc.

---

## Propuesta 2.3: bests <sup>(1)</sup>

- Definir la función `bests`, que dada una función de evaluación (`a -> Double`) y una lista.
- Retorna los elementos con máxima evaluación.

```haskell
bests :: (a -> Double) -> [a] -> [a]
bests ef xs = filter (\x -> (ef x) == maxEval) xs
  where maxEval = maximum (map ef xs)
```

- ¿Es correcta esta definición?
- ¿Puede definirse mejor?

---

## Propuesta 2.3: bests <sup>(2)</sup>

- Definir la función `bests`, que dada una función de evaluación (`a -> Double`) y una lista.
- Retorna los elementos con máxima evaluación.

```haskell
bests :: (a -> Double) -> [a] -> [a]
bests ef xs = map snd (filter (\(e, _) -> e == maxEval) evaluated)
  where evaluated = map (\x -> (ef x, x)) xs
        maxEval = maximum (map fst evaluated)
```

- ¿Es correcta esta definición?
- ¿Puede definirse mejor?

---

## Stackalc.hs

- Se desea implementar una calculadora de pila simple en Haskell.
  - El código será un `String`, donde cada caracter es un operador.
  - Las operaciones se aplicarán sobre una pila de `Double`.
- Por ejemplo:
  - `evaluate "123*+" = [7.0]`
  - `evaluate "21/0-" = [-0.5]`
- Se definirán dos funciones: `operator` & `evaluate`.

---

## Ejercicio 2.4: operator

- Definir la función `operator`, que retorna funciones dado un `Char`.
- Todas las funciones toman una lista de `Double` y retornan una lista de `Double`.
  - Los dígitos `"0123456789"` agregan el valor a la lista.
  - `operator '7' = (\ns -> 7.0:ns)`
  - Los símbolos `"+-*/"` toman dos valores y ponen el resultado.
  - `operator '+' = (\(n1:n2:ns) -> (n1 + n2):ns)`
  - En cualquier otro caso se debe arrojar un error.

---

## Propuesta 2.4: operator <sup>(1)</sup>

- Definir la función `operator`, que retorna funciones dado un `Char`.

```haskell
import Data.Char (isDigit)

operator :: Char -> ([Double] -> [Double])
operator '+' = (\(n1:n2:ns) -> (n1 + n2):ns)
operator '-' = (\(n1:n2:ns) -> (n1 - n2):ns)
operator '*' = (\(n1:n2:ns) -> (n1 * n2):ns)
operator '/' = (\(n1:n2:ns) -> (n1 / n2):ns)
operator d | isDigit d = let n = read [d] in (\ns -> n:ns)
operator c = error ("No operator for "++ (show c) ++"!")
```

- ¿Es correcta esta definición? ¿Puede definirse mejor?

---

## Propuesta 2.4: operator <sup>(2)</sup>

- Definir la función `operator`, que retorna funciones dado un `Char`.

```haskell
import Data.Char (isDigit)

operator :: Char -> [Double] -> [Double]
operator '+' (n1:n2:ns) = (n1 + n2):ns
operator '-' (n1:n2:ns) = (n1 - n2):ns
operator '*' (n1:n2:ns) = (n1 * n2):ns
operator '/' (n1:n2:ns) = (n1 / n2):ns
operator d ns | isDigit d = let n = read [d] in n:ns
operator c _ = error ("No operator for "++ (show c) ++"!")
```

- ¿Es correcta esta definición? ¿Puede definirse mejor?

---

## Ejercicio 2.5: evaluate

- Definir la función `evaluate`, que toma un `String` con una fórmula en notación posfija (polaca inversa).
- Retorna su evaluación usando la función `operator` anterior.
  - `evaluate "" = []`
  - `evaluate "123" = [3.0,2.0,1.0]`
  - `evaluate "123*+" = [7.0]`
  - `evaluate "21/0-" = [-0.5]`
  - `evaluate "12+3+4" = [4.0,6.0]`
  - `evaluate "1+" = error`
  - `evaluate "23!" = error`
- ¿Se podrá usar una función de alto orden estándar?

---

## Propuesta 2.5: evaluate

- Definir la función `evaluate`, que toma un `String` con una fórmula en notación posfija (polaca inversa).

```haskell
evaluate :: String -> [Double]
evaluate str = foldl (\ns c -> operator c ns) [] str
```

- ¿Es correcta esta definición? ¿Puede definirse mejor?

---

## Tipos algebraicos

- Enumerados (días de la semana, meses).

```haskell
data Directions = North | West | South | East
```

- Estructuras simples polimórficas (`Maybe`, `Either`).

```haskell
data Maybe a = Nothing | Just a
data Either a b = Left a | Right b
```

- Estructuras recursivas polimórficas (árboles).

```haskell
data Tree a = EmptyTree | Node a [Tree a]
```

---

## Tipos `data`

- Uno o más constructores.

```haskell
data Type1 = Cons1 | Cons2 ...
```

- Los constructores tienen cero o más *argumentos*.

```haskell
data Type2 = Cons1 Bool Int String
```

- Los argumentos tienen un tipo, y pueden ser recursivos.

```haskell
data RecType1 = BaseCase | RecCase RecType1
```

- Los `data` pueden ser polimórficos.

```haskell
data Type3 a b = ConsA a | ConsB [b]
```

---

## Ejercicio 3.1: Angle

- Se define un tipo para representar angulos medidos en grados, radianes y gradianes.

```haskell
data Angle = Degrees Double | Radians Double deriving (Eq, Show)
```

- Definir las funciones de conversión entre unidades, de la siguiente forma:
  - `toDegrees (Radians pi) = (Degrees 180.0)`
  - `toDegrees (Degrees 12.34) = (Degrees 12.34)`

---

## Propuesta 3.1: Angle

- Definir las funciones de conversión entre angulos medidos en grados, radianes y gradianes.

```haskell
toDegrees, toRadians :: Angle -> Angle

toDegrees a@(Degrees _) = a
toDegrees (Radians n) = (Degrees (n / pi * 180.0))

toRadians a@(Radians _) = a
toRadians (Degrees n) = (Radians (n / 180.0 * pi))
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Ejercicio 3.2: BinTree

- Definido un árbol binario de esta forma:

```haskell
data BinTree a = TreeNode a (BinTree a) (BinTree a)
   | EmptyTree deriving (Eq, Show)
```

- Definir las funciones de recorrida `preorder`, `inorder` y `postorder`.
  - `let leaf v = (TreeNode v EmptyTree EmptyTree)`
  - `let tree1 = (TreeNode 7 (leaf 3) (leaf 9))`
  - `preorder tree1 = [7, 3, 9]`
  - `inorder tree1 = [3, 7, 9]`
  - `postorder tree1 = [3, 9, 7]`
  - `preorder EmptyTree = []`

---

## Propuesta 3.2: BinTree

- Definir las funciones de recorrida `preorder`, `inorder` y `postorder`.

```haskell
preorder, inorder, postorder :: BinTree a -> [a]
preorder EmptyTree = []
preorder (TreeNode v l r) = (v:(preorder l)) ++ (preorder r)
...
inorder (TreeNode v l r) = (inorder l) ++ (v:(inorder r))
...
postorder (TreeNode v l r) = (postorder l) ++ (postorder r) ++ [v]
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Clases (de tipos)

- Permiten sobrecargar operaciones:
  - Cada tipo que instancia `Show` tiene su función `show`.
  - Cada tipo que instancia `Num` se puede sumar.
- Permite restringir los tipos posibles.
  - La función `sum` calcula la sumatoria de una lista.
  - `sum :: (Num a) => [a] -> a`
  - Cualquiera sea el tipo `a`, tiene que poder sumarse.
- Son similares a las interfaces de POO.
  - Pueden estar implementadas a medias.

---

## Ejemplo 3.3: Eq Angle

- Se desea definir la instancia de `Eq` para `Angle`.
  - `(Radians pi) == (Degrees 180.0) = True`
  - `(Gradians (-10.0)) == (Degrees (-9.0)) = True`

```haskell
asDegrees :: Angle -> Double
asDegrees a = let (Degrees d) = toDegrees a in d

instance Eq Angle where
  a1 == a2 = diff < epsilon
  where diff = abs ((asDegrees a1) - (asDegrees a2))
        epsilon = 1e-15
```

---

## Ejercicio 3.4: Ord Angle

- Dada la instancia `Eq` para `Angle`,
  - se desea poder comparar los valores ahora también por menor y mayor.
- Definir la instancia de `Ord` para `Angle`.
  - `(Radians pi) > (Degrees 100.0) = True`
  - `(Gradians (-9.0)) < (Degrees (-9.0)) = True`

---

## Propuesta 3.4: Ord Angle

- Definir la instancia de `Ord` para `Angle`.

```haskell
instance Ord Angle where
  compare a1 a2 = if (abs diff) < epsilon then EQ 
    else if diff < 0 then LT else GT
  where diff = (asDegrees a1) - (asDegrees a2)
        epsilon = 1e-15
```

- ¿Es correcta la implementación? ¿Puede definirse mejor?

---

## Epílogo

- En esta UT vimos:
  - Principios de programación funcional.
  - Funciones de alto orden, e.g.: `map`, `filter`, `foldl`, etc.
  - Tipos `data` y clases de Haskell.
- Proxima UT:
  - Generación de código con Haskell y MSIL.

<!-- .slide: data-background-color="#4d4d4d" -->
