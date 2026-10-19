---
layout: notebook
lang: es
section: teaching
alt_url: /en/teaching/ai-1/
course_url: /es/cursos/ia-1/
course_title: Inteligencia Artificial 1
title: "Notebook 4: Sentimiento con prompting"
summary: Clase 10 · Los tweets de la clase 9 clasificados por un LLM, sin entrenar nada, con prompts zero-shot y few-shot.
notebook: /es/cursos/ia-1/notebooks/04-sentimiento-con-prompting.ipynb
---
{% raw %}

En los notebooks 1 y 2 entrenamos una regresión logística con casi 1.800 tweets etiquetados. Ahora vamos a resolver la misma tarea **sin entrenar nada**: le vamos a pedir a un LLM que clasifique cada tweet, escribiendo instrucciones.

La pregunta es la misma de siempre: ¿qué tan bien funciona? Y para responderla hay que medir, igual que antes.

Donde aparezca `___` hay que completar el código que falta.

**Antes de empezar:** activar la GPU (menú *Entorno de ejecución* > *Cambiar tipo de entorno de ejecución* > *GPU*). Sin GPU funciona, pero cada evaluación tarda varios minutos.

## 1. Preparar el modelo y los datos

El mismo modelo del notebook 3 y los mismos tweets de los notebooks 1 y 2.

```python
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForCausalLM

DISPOSITIVO = "cuda" if torch.cuda.is_available() else "cpu"
NOMBRE = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(NOMBRE)
modelo = AutoModelForCausalLM.from_pretrained(
    NOMBRE, dtype=torch.float16 if DISPOSITIVO == "cuda" else torch.float32
).to(DISPOSITIVO)

URL = "https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual/resolve/main/data/spanish"
train = pd.read_json(f"{URL}/train.jsonl", lines=True)
test = pd.read_json(f"{URL}/test.jsonl", lines=True)

NOMBRES = {0: "negativo", 1: "neutral", 2: "positivo"}
```

Un LLM es mucho más lento que una regresión logística: tiene que generar una respuesta por cada tweet. Para no esperar demasiado, evaluamos con una **muestra** de 90 tweets de prueba, 30 de cada clase.

```python
muestra = test.groupby("label").sample(30, random_state=0).reset_index(drop=True)
muestra["label"].map(NOMBRES).value_counts()
```

## 2. Preguntarle al modelo

Esta función recibe una lista de mensajes (como en el notebook 3), genera la respuesta con temperatura 0 y la devuelve como texto. Pedimos pocos tokens: solo queremos una palabra.

```python
def responder(mensajes, max_tokens=5):
    ids = tokenizer.apply_chat_template(
        mensajes, add_generation_prompt=True, return_tensors="pt", return_dict=True
    ).to(DISPOSITIVO)
    salida = modelo.generate(**ids, do_sample=False, max_new_tokens=max_tokens)
    return tokenizer.decode(salida[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)
```

El modelo responde texto, pero para medir necesitamos una etiqueta (0, 1 o 2). Esta función busca el nombre de una clase en la respuesta. Si no encuentra ninguno, devuelve -1 ("sin respuesta válida").

```python
def a_etiqueta(respuesta):
    respuesta = respuesta.lower()
    for clase, nombre in NOMBRES.items():
        if nombre in respuesta:
            return clase
    return -1

a_etiqueta("Positivo."), a_etiqueta("No estoy seguro")
```

## 3. Zero-shot: solo la instrucción

Un **prompt** es una función que recibe un tweet y arma los mensajes para el modelo. Completar la instrucción con las tres clases posibles:

```python
def prompt_zero_shot(tweet):
    instruccion = (
        "Clasificá el sentimiento de este tweet como ___. "
        "Respondé con una sola palabra."
    )
    return [{"role": "user", "content": f"{instruccion}\n\nTweet: {tweet}"}]

tweet = muestra["text"][0]
print(tweet)
print("->", responder(prompt_zero_shot(tweet)))
```

Esta función aplica un prompt a todos los tweets de la muestra y mide, como en la clase 3. Completar con la función que calcula el accuracy:

```python
from sklearn.metrics import accuracy_score, ConfusionMatrixDisplay

def evaluar(prompt):
    respuestas = [responder(prompt(t)) for t in muestra["text"]]
    predicciones = [a_etiqueta(r) for r in respuestas]
    print(f"Accuracy: {___(muestra['label'], predicciones):.1%}")
    print("Respuestas no válidas:", predicciones.count(-1))
    ConfusionMatrixDisplay.from_predictions(
        muestra["label"].map(NOMBRES), [NOMBRES.get(p, "otra") for p in predicciones], cmap="Blues"
    )
    return predicciones

pred_zero = evaluar(prompt_zero_shot)
```

Comparar con lo que anotaron en los notebooks 1 (TF-IDF) y 2 (embeddings). ¿Qué clase confunde más? ¿Hacia qué clase se van los errores?

## 4. Few-shot: con ejemplos

Ahora le mostramos algunos tweets ya resueltos **antes** del que queremos clasificar. Cada ejemplo es un par de mensajes: el tweet (rol `user`) y la respuesta correcta (rol `assistant`). Es como si el modelo ya hubiera respondido bien unas cuantas veces.

Tomamos los ejemplos del conjunto de **entrenamiento**, nunca de la muestra que usamos para medir.

```python
ejemplos = train.groupby("label").sample(2, random_state=1).sample(frac=1, random_state=1)
for _, fila in ejemplos.iterrows():
    print(f"{NOMBRES[fila['label']]:>9}: {fila['text']}")
```

Completar con el rol de la respuesta del modelo:

```python
def prompt_few_shot(tweet):
    instruccion = (
        "Clasificá el sentimiento de cada tweet como positivo, negativo o neutral. "
        "Respondé con una sola palabra."
    )
    mensajes = [{"role": "system", "content": instruccion}]
    for _, fila in ejemplos.iterrows():
        mensajes.append({"role": "user", "content": f"Tweet: {fila['text']}"})
        mensajes.append({"role": "___", "content": NOMBRES[fila["label"]]})
    mensajes.append({"role": "user", "content": f"Tweet: {tweet}"})
    return mensajes

pred_few = evaluar(prompt_few_shot)
```

¿Mejoró? Los pesos del modelo son exactamente los mismos: lo único que cambió es el texto que recibe.

## 5. Un prompt mejor

En los notebooks 1 y 2, la clase más difícil era **neutral**. ¿Qué significa exactamente "neutral"? El modelo no lo sabe: en este dataset, un tweet es neutral si informa, pregunta o comenta algo sin expresar una emoción clara.

Escribir una instrucción que lo explique. Algunas ideas: definir cada clase, aclarar qué hacer con la ironía, recordarle el formato de la respuesta.

```python
INSTRUCCION = """___"""

def prompt_propio(tweet):
    mensajes = [{"role": "system", "content": INSTRUCCION}]
    for _, fila in ejemplos.iterrows():
        mensajes.append({"role": "user", "content": f"Tweet: {fila['text']}"})
        mensajes.append({"role": "assistant", "content": NOMBRES[fila["label"]]})
    mensajes.append({"role": "user", "content": f"Tweet: {tweet}"})
    return mensajes

pred_propio = evaluar(prompt_propio)
```

Probar cambiar la instrucción y volver a ejecutar. Cuidado: si prueban muchas variantes y se quedan con la mejor, están ajustando el prompt **a esta muestra**, como si eligieran hiperparámetros mirando el conjunto de prueba (clase 6). Para una decisión seria haría falta medir el prompt elegido en tweets nuevos.

## 6. Mirar los errores

Los números no alcanzan: hay que leer en qué se equivoca.

```python
errores = muestra.assign(prediccion=[NOMBRES.get(p, "otra") for p in pred_propio])
errores["real"] = errores["label"].map(NOMBRES)
errores = errores[errores["real"] != errores["prediccion"]]
pd.set_option("display.max_colwidth", 120)
columnas = ["text", "real", "prediccion"]
errores[columnas].head(15)
```

¿Hay errores en los que ustedes también dudarían? ¿Alguna etiqueta "real" les parece discutible?

## 7. Para pensar

- ¿Le ganó el LLM al modelo del notebook 2? ¿Qué ventajas tiene cada uno? Piensen en datos etiquetados necesarios, velocidad, costo por tweet y facilidad para cambiar la tarea (por ejemplo, agregar una clase "sarcasmo").
- Usamos un modelo chico (1.500 millones de parámetros). Un modelo mucho más grande probablemente lo haría mejor. ¿Cómo lo decidirían con evidencia, y no con una impresión?
- ¿Por qué usamos temperatura 0 para clasificar?

## Extra (opcional): ¿qué tan seguro está?

En lugar de generar una palabra, podemos mirar directamente la probabilidad que el modelo le da al primer token de cada clase, como en el notebook 3. Así obtenemos algo parecido al `predict_proba` de la regresión logística.

```python
def probabilidades_clases(tweet, prompt=prompt_propio):
    ids = tokenizer.apply_chat_template(
        prompt(tweet), add_generation_prompt=True, return_tensors="pt", return_dict=True
    ).to(DISPOSITIVO)
    with torch.no_grad():
        p = torch.softmax(modelo(**ids).logits[0, -1].float(), dim=-1)
    # El modelo puede empezar la respuesta en minúscula o en mayúscula: sumamos las dos.
    puntaje = {
        nombre: sum(p[tokenizer.encode(forma)[0]].item() for forma in (nombre, nombre.capitalize()))
        for nombre in NOMBRES.values()
    }
    total = sum(puntaje.values())
    for nombre, valor in puntaje.items():
        print(f"{nombre:>9}: {valor / total:.0%}")

probabilidades_clases("Qué buen servicio, solo tardaron tres horas")
```

{% endraw %}
