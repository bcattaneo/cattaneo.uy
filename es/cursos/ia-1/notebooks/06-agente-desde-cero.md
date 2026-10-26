---
layout: notebook
lang: es
section: teaching
alt_url: /en/teaching/ai-1/
course_url: /es/cursos/ia-1/
course_title: Inteligencia Artificial 1
title: "Notebook 6: Un agente desde cero"
summary: Clase 11 · Herramientas y el bucle de un agente (ReAct), escritos a mano con un LLM chico.
notebook: /es/cursos/ia-1/notebooks/06-agente-desde-cero.ipynb
---
{% raw %}

En el notebook 5 armamos un asistente con RAG: **siempre** buscaba en el programa y después respondía. Los pasos los decidíamos nosotros.

Un **agente** es distinto: el LLM **decide** qué hacer. Tiene a su disposición algunas **herramientas** (funciones de Python) y, en cada paso, elige si usar una (y cuál, y con qué datos) o responder. Nosotros solo ejecutamos lo que pide y le devolvemos el resultado, en un bucle.

En este notebook vamos a construir ese bucle a mano, sin ninguna librería de agentes, para ver que no hay magia.

Donde aparezca `___` hay que completar el código que falta.

**Antes de empezar:** activar la GPU (menú *Entorno de ejecución* > *Cambiar tipo de entorno de ejecución* > *GPU*).

## 1. Preparar los modelos

Los mismos de los notebooks anteriores: el LLM Qwen2.5 1.5B y el modelo de embeddings para buscar en el programa del curso.

```python
%pip install -q sentence-transformers
```

```python
import json
import re
from datetime import date

import torch
import pandas as pd
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim
from transformers import AutoTokenizer, AutoModelForCausalLM

DISPOSITIVO = "cuda" if torch.cuda.is_available() else "cpu"

modelo_emb = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")

NOMBRE = "Qwen/Qwen2.5-1.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(NOMBRE)
llm = AutoModelForCausalLM.from_pretrained(
    NOMBRE, dtype=torch.float16 if DISPOSITIVO == "cuda" else torch.float32
).to(DISPOSITIVO)
```

## 2. El problema

Una pregunta que necesita **varias cosas** a la vez: saber la fecha de hoy, buscar la fecha de la Prueba Final en el programa, y hacer una cuenta.

```python
def preguntar_llm(mensajes, herramientas=None, max_tokens=200):
    ids = tokenizer.apply_chat_template(
        mensajes, tools=herramientas, add_generation_prompt=True,
        return_tensors="pt", return_dict=True
    ).to(DISPOSITIVO)
    salida = llm.generate(**ids, do_sample=False, max_new_tokens=max_tokens)
    return tokenizer.decode(salida[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)

PREGUNTA = "¿Cuántos días faltan para la Prueba Final de Inteligencia Artificial 1?"
print(preguntar_llm([{"role": "user", "content": PREGUNTA}]))
```

El modelo no sabe qué día es hoy, no conoce el programa del curso y, además, los LLM se equivocan seguido con las cuentas. Ninguna de esas tres cosas se arregla con un mejor prompt: le faltan **herramientas**.

## 3. Las herramientas

Una herramienta es una función común de Python. Vamos a darle tres:

- `fecha_de_hoy`: devuelve la fecha actual.
- `calcular`: hace una cuenta.
- `buscar_programa`: busca en el programa del curso, igual que en el notebook 5.

Lo más importante de cada herramienta es su **descripción** (el *docstring*): es lo único que el modelo va a leer para decidir cuándo usarla y con qué datos. La descripción también es un prompt.

```python
fragmentos = [
    ("Evaluación", "Puntos de cada evaluación (total 100): cinco iRAT/tRAT, 10 puntos. Caso 1, grupal, 7,5 puntos. Caso 2, grupal, 7,5 puntos. Parcial 1, individual, 20 puntos. Parcial 2, individual, 20 puntos. Prueba Final, parte individual y defensa grupal, 35 puntos."),
    ("Puntos adicionales", "Se pueden sumar puntos adicionales: evidencias seleccionadas hasta +5; podio del Caso 1, +2,5; podio del Caso 2, +2,5. El máximo adicional es +10. La nota oficial tiene tope de 100."),
    ("Cronograma (agosto y setiembre)", "Clase 1, 3 de agosto de 2026: qué es IA. Clase 2, 10 de agosto: lanzamiento del Caso 1. Clase 5, 31 de agosto: redes neuronales. Clase 7, 14 de setiembre de 2026: Parcial 1 y lanzamiento del Caso 2. 28 de setiembre: no hay clase, Semana UCU."),
    ("Cronograma (octubre)", "Clase 9, 5 de octubre de 2026: Transformers y embeddings. 12 de octubre: feriado. Clase 10, 19 de octubre de 2026: LLMs, prompting y RAG. Clase 11, 26 de octubre de 2026: agentes."),
    ("Cronograma (noviembre)", "2 de noviembre de 2026: feriado, actividad asincrónica. Clase 12, 9 de noviembre de 2026: Parcial 2 e introducción a MLOps. Clase 13, 16 de noviembre de 2026: pipeline y preparación del Final. Clase 14, 23 de noviembre de 2026: Prueba Final."),
    ("Condiciones académicas: aprobación", "La materia se aprueba desde 65%, con un mínimo de 40% en el Final. Si el Final supera a un parcial por al menos 10 puntos, ese parcial se sustituye por Final - 10, sin reducir notas."),
    ("Condiciones académicas: parciales y equipos", "Los parciales duran 80 minutos: 25 minutos de cuestionario, 50 de mini-lab y 5 de entrega. Los equipos son de tres estudiantes como formato preferido, admitiendo parejas."),
]
documentos = pd.DataFrame(fragmentos, columns=["seccion", "texto"])
vectores = modelo_emb.encode(documentos["texto"].tolist())


def fecha_de_hoy() -> str:
    """Devuelve la fecha de hoy, en formato AAAA-MM-DD."""
    return date.today().isoformat()


def calcular(expresion: str) -> str:
    """Calcula una expresión aritmética y devuelve el resultado.

    Args:
        expresion: La cuenta a hacer, por ejemplo "(35 * 0.4) + 2". Solo números y + - * / ( ).
    """
    if not re.fullmatch(r"[0-9+\-*/(). ]+", expresion):
        return "Error: la expresión solo puede tener números y + - * / ( )"
    return str(round(eval(expresion), 4))


def buscar_programa(consulta: str) -> str:
    """Busca en el programa del curso Inteligencia Artificial 1 (fechas, evaluaciones, puntos, condiciones de aprobación).

    Args:
        consulta: Qué buscar, por ejemplo "fecha de la Prueba Final".
    """
    similitudes = cos_sim(modelo_emb.encode(consulta), vectores)[0]
    mejores = similitudes.argsort(descending=True)[:2].tolist()
    return "\n".join(f"{documentos['seccion'][i]}: {documentos['texto'][i]}" for i in mejores)


HERRAMIENTAS = {"fecha_de_hoy": fecha_de_hoy, "calcular": calcular, "buscar_programa": buscar_programa}

print(fecha_de_hoy())
print(calcular("(35 * 0.4) + 2"))
print(buscar_programa("fecha de la Prueba Final"))
```

Fíjense en `calcular`: antes de ejecutar la cuenta, **revisa con código** que la expresión tenga solo números y operadores. `eval` ejecuta cualquier código de Python, y el texto que le llega lo escribe el modelo. Nunca hay que ejecutar sin control algo que escribió un LLM.

## 4. Las herramientas también son texto

¿Cómo se entera el modelo de que existen estas funciones? Igual que con el chat en el notebook 3: todo termina siendo **texto** en el prompt. La librería lee el nombre, los parámetros y la descripción de cada función y los escribe en el mensaje de sistema. Veamos el prompt completo (sin convertir a tokens):

```python
lista = list(HERRAMIENTAS.values())
texto = tokenizer.apply_chat_template(
    [{"role": "user", "content": PREGUNTA}], tools=lista, add_generation_prompt=True, tokenize=False
)
print(texto)
```

El modelo fue entrenado para que, si quiere usar una herramienta, responda con un JSON entre etiquetas `<tool_call>` y `</tool_call>`. Probemos:

```python
respuesta = preguntar_llm([{"role": "user", "content": PREGUNTA}], herramientas=lista)
print(respuesta)
```

El modelo **no ejecutó nada**. Solo escribió un pedido: "quiero llamar a esta función con estos argumentos". Ejecutarlo (o no) es responsabilidad de nuestro programa.

## 5. Leer el pedido y ejecutarlo

Buscamos los bloques `<tool_call>…</tool_call>` en la respuesta y convertimos el JSON de adentro en un diccionario de Python. Completar con la función que lee un texto JSON:

```python
def leer_pedidos(respuesta):
    bloques = re.findall(r"<tool_call>(.*?)</tool_call>", respuesta, re.S)
    return [json.___(b) for b in bloques]

pedidos = leer_pedidos(respuesta)
pedidos
```

Para ejecutar un pedido buscamos la función por su nombre y la llamamos con los argumentos. Si el modelo pide una herramienta que no existe o con argumentos incorrectos, no cortamos el programa: le devolvemos el error como texto, así puede corregirse en el paso siguiente.

```python
def ejecutar(pedido):
    funcion = HERRAMIENTAS.get(pedido["name"])
    if funcion is None:
        return f"Error: no existe la herramienta {pedido['name']}"
    try:
        return funcion(**pedido.get("arguments", {}))
    except Exception as e:
        return f"Error: {e}"

for pedido in pedidos:
    print(pedido["name"], "->", ejecutar(pedido))
```

## 6. El bucle del agente

Ahora juntamos todo en el bucle que vimos en la clase (ReAct: **pensar → actuar → observar**, y repetir):

1. Le mandamos la conversación al modelo, junto con las herramientas.
2. Si en la respuesta **no hay pedidos**, es la respuesta final: terminamos.
3. Si hay pedidos, los ejecutamos, agregamos los resultados a la conversación (con el rol `tool`) y volvemos al paso 1.

Siempre con un **máximo de pasos**: un agente puede quedarse dando vueltas.

Además, guardamos una **traza**: un registro de cada herramienta usada, con sus argumentos y su resultado. Sin traza no hay forma de saber qué hizo el agente ni por qué.

Completar la condición de fin: no hay ningún pedido.

```python
SISTEMA = (
    "Sos el asistente de la materia Inteligencia Artificial 1 de la Universidad Católica del Uruguay. "
    "No conocés ningún dato del curso: para cualquier fecha, punto o regla del curso usá SIEMPRE la herramienta buscar_programa. "
    "Para saber qué día es hoy usá fecha_de_hoy. Para cualquier cuenta usá calcular. "
    "Nunca le pidas datos al usuario: buscalos con las herramientas, de a un paso por vez. "
    "Cuando tengas todo, respondé en español, en pocas oraciones."
)

def agente(pregunta, max_pasos=6):
    mensajes = [{"role": "system", "content": SISTEMA}, {"role": "user", "content": pregunta}]
    traza = []
    for paso in range(1, max_pasos + 1):
        respuesta = preguntar_llm(mensajes, herramientas=lista)
        pedidos = leer_pedidos(respuesta)
        if ___:
            print(f"Respuesta final (paso {paso}):", respuesta)
            return respuesta, traza
        mensajes.append({"role": "assistant", "content": "", "tool_calls": [
            {"type": "function", "function": p} for p in pedidos
        ]})
        for pedido in pedidos:
            resultado = ejecutar(pedido)
            traza.append({"paso": paso, "herramienta": pedido["name"],
                          "argumentos": pedido.get("arguments"), "resultado": resultado})
            print(f"Paso {paso}: {pedido['name']}({pedido.get('arguments')})")
            mensajes.append({"role": "tool", "name": pedido["name"], "content": resultado})
    print("Se alcanzó el máximo de pasos sin respuesta final.")
    return None, traza

respuesta, traza = agente(PREGUNTA)
```

La traza muestra lo que hizo, paso a paso:

```python
pd.set_option("display.max_colwidth", 120)
pd.DataFrame(traza)
```

Miren la traza con atención:

- ¿Qué herramientas usó y en qué orden? ¿Era necesario cada paso?
- ¿Los argumentos tienen sentido? (por ejemplo, ¿la cuenta que le pidió a `calcular` es la correcta?)
- ¿La respuesta final usa los resultados de las herramientas, o los ignora?

Es un modelo chico (1.500 millones de parámetros), así que va a cometer errores. La traza es lo que nos permite ver **dónde**: ¿eligió mal la herramienta, pasó mal los argumentos, o tenía los datos correctos y respondió mal igual?

## 7. Más preguntas

Algunas preguntas necesitan una sola herramienta, otras varias, y otras ninguna:

```python
agente("¿Cuánto es 17 por 23?");
```

```python
agente("¿Cuántos puntos vale el Parcial 2?");
```

```python
agente("Hola, ¿cómo estás?");
```

Ahora una pregunta propia. Intenten encontrar una en la que el agente falle, y usen la traza para explicar por qué falló.

```python
respuesta, traza = agente("___")
pd.DataFrame(traza)
```

## 8. Para pensar

- ¿En qué se diferencia este agente del asistente con RAG del notebook 5? ¿Quién decide cuándo buscar en cada caso?
- El modelo nunca ejecuta código: solo escribe texto. ¿Dónde está, entonces, el "poder" (y el riesgo) de un agente?
- ¿Qué pasaría si agregáramos una herramienta `enviar_mail`? ¿La dejarían usar sin preguntar? Lo vemos en el notebook 7.
- ¿Para qué sirve `max_pasos`? ¿Qué pasaría sin él?

{% endraw %}
