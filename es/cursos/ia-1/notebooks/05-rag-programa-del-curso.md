---
layout: notebook
lang: es
section: teaching
alt_url: /en/teaching/ai-1/
course_url: /es/cursos/ia-1/
course_title: Inteligencia Artificial 1
title: "Notebook 5: RAG sobre el programa del curso"
summary: Clase 10 · Un asistente que responde preguntas sobre el programa de IA 1 con búsqueda semántica y un LLM, y cómo evaluarlo.
notebook: /es/cursos/ia-1/notebooks/05-rag-programa-del-curso.ipynb
---
{% raw %}

En el notebook 3 vimos que el modelo inventa cuando le preguntamos por el curso: nunca vio el programa. Ahora vamos a armar un pequeño asistente con **RAG** (*Retrieval-Augmented Generation*):

1. Partimos el programa del curso en fragmentos y los convertimos en embeddings (como en el notebook 2).
2. Ante cada pregunta, **buscamos** los fragmentos más parecidos (búsqueda semántica).
3. Le pasamos esos fragmentos al LLM junto con la pregunta, y le pedimos que responda **solo** con esa información.

Al final lo vamos a **evaluar** con un pequeño conjunto de preguntas.

Donde aparezca `___` hay que completar el código que falta.

**Antes de empezar:** activar la GPU (menú *Entorno de ejecución* > *Cambiar tipo de entorno de ejecución* > *GPU*).

## 1. Preparar los modelos

Necesitamos dos modelos: el de embeddings del notebook 2 (para buscar) y el LLM de los notebooks 3 y 4 (para responder).

```python
%pip install -q sentence-transformers
```

```python
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

def preguntar_llm(mensajes, max_tokens=150):
    ids = tokenizer.apply_chat_template(
        mensajes, add_generation_prompt=True, return_tensors="pt", return_dict=True
    ).to(DISPOSITIVO)
    salida = llm.generate(**ids, do_sample=False, max_new_tokens=max_tokens)
    return tokenizer.decode(salida[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)
```

## 2. Sin RAG

Primero, el problema. Le preguntamos al LLM, sin darle ninguna información:

```python
PREGUNTA = "Si me va mal en el Parcial 1 de Inteligencia Artificial 1, ¿lo puedo recuperar?"
print(preguntar_llm([{"role": "user", "content": PREGUNTA}]))
```

## 3. Los documentos

Este es el programa del curso, ya partido en **fragmentos** (*chunks*). Lo partimos a mano, respetando las secciones del documento: cada fragmento habla de un solo tema. Cada uno tiene la sección de donde sale, para poder citarlo.

```python
fragmentos = [
    ("Propuesta", "El curso ofrece un recorrido práctico por datos, machine learning clásico, deep learning, visión por computadora, NLP, agentes y MLOps. El objetivo es que el estudiante pueda formular un problema, construir una referencia, comparar alternativas, analizar errores y comunicar una decisión con evidencia. La materia se dicta en 14 clases (2 feriados). La extensión para casa es una sola actividad de 60 a 90 minutos."),
    ("Evaluación", "Puntos de cada evaluación (total 100): cinco iRAT/tRAT, mixta individual y grupal, 10 puntos. Caso 1 en portafolio, calificación grupal, 7,5 puntos. Caso 2 en portafolio, calificación grupal, 7,5 puntos. Parcial 1, individual controlado, 20 puntos. Parcial 2, individual controlado, 20 puntos. Prueba Final, parte individual y defensa grupal, 35 puntos."),
    ("Desglose: iRAT y tRAT", "Cada iRAT es individual y vale 1,5 puntos (5 × 1,5 = 7,5 puntos). Cada tRAT es grupal y vale 0,5 puntos (5 × 0,5 = 2,5 puntos)."),
    ("Desglose: parciales", "Cada parcial (Parcial 1 y Parcial 2) vale 20 puntos: 7 puntos de preguntas de las unidades, 3 puntos de preguntas sobre el caso de estudio y 10 puntos de mini-lab."),
    ("Desglose: Prueba Final", "La Prueba Final vale 35 puntos: cuestionario comprehensivo individual (8,75 puntos), modificación individual de un caso (8,75 puntos) y presentación y defensa grupal de los casos de estudio (17,5 puntos). En total, el curso tiene 65 puntos individuales y 35 grupales."),
    ("Puntos adicionales", "Se pueden sumar puntos adicionales: evidencias seleccionadas, incluidas las actividades de los feriados, hasta +5; podio del Caso 1, +2,5; podio del Caso 2, +2,5. El máximo adicional es +10. La nota oficial tiene tope de 100. El podio son los 3 equipos con mejores resultados en el caso de estudio, que es el mismo dataset y problema para todos."),
    ("Flujo: RAT", "Cada unidad tiene un iRAT y un tRAT calificados. Cuando una unidad comienza en el segundo módulo de un parcial, el RAT se realiza en la clase siguiente. En la UT4 el RAT también pasa a la segunda clase, para no evaluar inmediatamente después de la Semana UCU."),
    ("Flujo: casos de estudio", "Cada mitad del curso incluye un caso común para equipos de dos o tres estudiantes. La entrega, el registro en portafolio y la nota son grupales. Los casos se entregan antes de cada parcial y reciben devolución grupal; no hay defensa ese día. El parcial puede incluir preguntas individuales sobre el caso. El parcial de código evalúa la unidad que no se trabajó en el caso."),
    ("Flujo: Prueba Final", "La Prueba Final integra todo el curso: cuestionario comprehensivo, modificación individual de uno de los casos y presentación con defensa grupal."),
    ("Cronograma (agosto y setiembre)", "Clase 1, 3 de agosto: qué es IA, CRISP-DM y EDA. Clase 2, 10 de agosto: iRAT/tRAT 1, baseline, regresión y MLflow, lanzamiento del Caso 1. Clase 3, 17 de agosto: clasificación y métricas. Clase 4, 24 de agosto: clustering y PCA. Clase 5, 31 de agosto: iRAT/tRAT 2, redes neuronales. Clase 6, 7 de setiembre: optimización y regularización."),
    ("Cronograma (setiembre y octubre)", "Clase 7, 14 de setiembre: Parcial 1 e introducción a CNN, lanzamiento del Caso 2. Clase 8, 21 de setiembre: iRAT/tRAT 3, detección y segmentación. 28 de setiembre: no hay clase, Semana UCU. Clase 9, 5 de octubre: Transformers, embeddings y búsqueda semántica. 12 de octubre: feriado, actividad asincrónica."),
    ("Cronograma (octubre y noviembre)", "Clase 10, 19 de octubre: iRAT/tRAT 4, LLMs, prompting y RAG. Clase 11, 26 de octubre: agentes. 2 de noviembre: feriado, actividad asincrónica. Clase 12, 9 de noviembre: Parcial 2 e introducción a MLOps. Clase 13, 16 de noviembre: iRAT/tRAT 5, pipeline y preparación del Final. Clase 14, 23 de noviembre: Prueba Final."),
    ("Condiciones académicas: aprobación", "La materia se aprueba desde 65%, con un mínimo de 40% en el Final. Si el Final supera a un parcial por al menos 10 puntos, ese parcial se sustituye por Final - 10, sin reducir notas."),
    ("Condiciones académicas: parciales y equipos", "Los parciales duran 80 minutos: 25 minutos de cuestionario, 50 de mini-lab y 5 de entrega. Toda evaluación se devuelve en un máximo de siete días corridos mediante WebAsignatura. Los equipos son de tres estudiantes como formato preferido, admitiendo parejas cuando el número de estudiantes lo requiera."),
]
documentos = pd.DataFrame(fragmentos, columns=["seccion", "texto"])
documentos
```

## 4. Indexar

Convertimos cada fragmento en un vector, igual que con los tweets en el notebook 2. Esto se hace **una sola vez**.

```python
vectores = modelo_emb.encode(documentos["texto"].tolist())
print("Fragmentos x dimensiones:", vectores.shape)
```

## 5. Buscar

Para buscar, convertimos la pregunta en un vector con **el mismo modelo** y calculamos la similitud coseno contra todos los fragmentos. Nos quedamos con los `k` más parecidos. Completar con la función de similitud:

```python
def buscar(pregunta, k=3):
    vector = modelo_emb.encode(pregunta)
    similitudes = ___(vector, vectores)[0]
    mejores = similitudes.argsort(descending=True)[:k]
    return [(int(i), round(similitudes[i].item(), 2)) for i in mejores]

for i, similitud in buscar(PREGUNTA):
    print(similitud, documentos["seccion"][i])
```

¿Está el fragmento que tiene la respuesta ("Condiciones académicas: aprobación")? Miren las secciones que encontró. La pregunta menciona "Parcial 1", y eso se parece mucho a los fragmentos del cronograma, que nombran los parciales y las clases. Es una **falla de recuperación**: si el fragmento correcto no aparece, el LLM no va a poder responder bien.

Probemos la misma pregunta, dicha de otra forma:

```python
for i, similitud in buscar("Si me va mal en un parcial, ¿lo puedo recuperar?"):
    print(similitud, documentos["seccion"][i])
```

Ahora sí aparece. Fíjense que la pregunta dice "recuperar" y el fragmento dice "sustituye": no comparten esa palabra, pero los embeddings los acercan igual.

Probar con una pregunta propia:

```python
for i, similitud in buscar("___"):
    print(similitud, documentos["seccion"][i])
```

## 6. Armar el prompt

El prompt de RAG tiene tres piezas clave:

- responder **solo** con la información del contexto,
- **citar** el número de cada fragmento usado,
- una salida para cuando no sabe: **"No lo sé"**.

Completar con la variable que tiene los fragmentos encontrados:

```python
SISTEMA = (
    "Sos el asistente de la materia Inteligencia Artificial 1 de la Universidad Católica del Uruguay. "
    "Respondé la pregunta usando SOLO la información del contexto. "
    "Citá entre corchetes el número de cada fragmento que uses, por ejemplo [2]. "
    'Si la respuesta no está en el contexto, respondé exactamente: "No lo sé".'
)

def armar_prompt(pregunta, encontrados):
    contexto = "\n".join(
        f"[{n}] {documentos['seccion'][i]}: {documentos['texto'][i]}"
        for n, (i, _) in enumerate(encontrados, start=1)
    )
    return [
        {"role": "system", "content": SISTEMA},
        {"role": "user", "content": f"Contexto:\n{___}\n\nPregunta: {pregunta}"},
    ]

print(armar_prompt(PREGUNTA, buscar(PREGUNTA))[1]["content"])
```

## 7. Responder

Juntamos todo: buscar, armar el prompt y generar.

```python
def rag(pregunta, k=3, mostrar=True):
    encontrados = buscar(pregunta, k)
    respuesta = preguntar_llm(armar_prompt(pregunta, encontrados))
    if mostrar:
        print("Pregunta:", pregunta)
        for n, (i, similitud) in enumerate(encontrados, start=1):
            print(f"  [{n}] {documentos['seccion'][i]} ({similitud})")
        print("Respuesta:", respuesta, "\n")
    return respuesta, encontrados

rag(PREGUNTA)
rag("Si me va mal en un parcial, ¿lo puedo recuperar?")
rag("¿Cuántos puntos vale la Prueba Final?");
```

Comparar con las respuestas de la sección 2 y del notebook 3:

- Con la primera pregunta la búsqueda falló. ¿El modelo inventó algo o dijo "No lo sé"? Si dijo "No lo sé", hizo lo correcto: con ese contexto no había forma de saberlo.
- En las otras, ¿la respuesta usa lo que dice el fragmento? ¿Las citas apuntan al fragmento correcto?

Ahora una pregunta cuya respuesta **no está** en el programa. ¿Dice "No lo sé" o inventa?

```python
rag("¿Quién es el decano de la facultad?");
```

Hacer preguntas propias sobre el curso. Intenten encontrar una que el asistente responda mal. Después miren los fragmentos que encontró: ¿el problema fue la **búsqueda** o la **generación**?

```python
rag("___");
```

## 8. Evaluar

Probar con algunas preguntas sueltas no alcanza para saber si el asistente funciona. Armamos un pequeño **conjunto de prueba**: preguntas con la respuesta esperada (un dato clave que tiene que aparecer) y el fragmento que la contiene. Las dos últimas no tienen respuesta en el programa: lo correcto es "No lo sé".

```python
prueba = pd.DataFrame([
    ("¿Con qué porcentaje se aprueba la materia?", "65", 12),
    ("Si me va mal en un parcial, ¿lo puedo recuperar?", "sustitu", 12),
    ("¿Cuántos puntos vale el Caso 2?", "7,5", 1),
    ("¿Hay clase el 28 de setiembre?", "Semana UCU", 10),
    ("¿Cuánto dura el cuestionario del parcial?", "25", 13),
    ("¿Qué fecha es la Prueba Final?", "23 de noviembre", 11),
    ("¿Cuántos puntos extra se pueden sumar como máximo?", "10", 5),
    ("¿En cuántos días devuelven las notas de las evaluaciones?", "siete", 13),
    ("¿Quién es el decano de la facultad?", "No lo sé", None),
    ("¿Se puede usar ChatGPT durante el parcial?", "No lo sé", None),
], columns=["pregunta", "esperado", "fragmento"])
prueba
```

Evaluamos las dos partes por separado:

- **Recuperación** (*recall@k*): ¿el fragmento correcto quedó entre los `k` encontrados? Solo tiene sentido en las preguntas que tienen respuesta.
- **Respuesta**: ¿aparece el dato esperado en la respuesta? Es una regla simple, pero alcanza para respuestas cortas como números o fechas.

Completar la condición de recuperación: el fragmento correcto tiene que estar **en** la lista de encontrados.

```python
def evaluar(k):
    filas = []
    for _, caso in prueba.iterrows():
        respuesta, encontrados = rag(caso["pregunta"], k, mostrar=False)
        indices = [i for i, _ in encontrados]
        filas.append({
            "pregunta": caso["pregunta"],
            "recuperado": None if pd.isna(caso["fragmento"]) else caso["fragmento"] ___ indices,
            "correcta": caso["esperado"].lower() in respuesta.lower(),
            "respuesta": respuesta,
        })
    resultados = pd.DataFrame(filas)
    print(f"k={k}  recall@k: {resultados['recuperado'].dropna().mean():.0%}  "
          f"respuestas correctas: {resultados['correcta'].mean():.0%}")
    return resultados

pd.set_option("display.max_colwidth", 150)
resultados = evaluar(k=3)
resultados
```

Mirar las respuestas una por una, no solo los porcentajes:

- Las marcadas como incorrectas, ¿lo son realmente, o la regla del "dato esperado" es demasiado estricta?
- Las marcadas como correctas, ¿lo son? Un "10" puede aparecer en la respuesta por casualidad.
- Cuando el fragmento correcto fue recuperado y aun así la respuesta está mal, el problema es la **generación**.

Ese es el problema de evaluar texto libre: las métricas automáticas son una primera aproximación, pero hay que leer las respuestas.

Ahora con un solo fragmento. ¿Qué pasa con el recall? ¿Y con las respuestas?

```python
evaluar(k=___)
```

## 9. Para pensar

- Cuando una respuesta fue incorrecta, ¿falló la recuperación o la generación? ¿Cómo lo saben?
- Si el programa cambia (por ejemplo, se mueve la fecha de un parcial), ¿qué hay que hacer en este sistema? ¿Y si hubiéramos reentrenado el LLM con el programa?
- Las citas, ¿alcanzan para confiar en una respuesta? ¿Quién las verifica?
- Agreguen al conjunto de prueba dos preguntas propias, una con respuesta y otra sin respuesta, y vuelvan a evaluar.

{% endraw %}
