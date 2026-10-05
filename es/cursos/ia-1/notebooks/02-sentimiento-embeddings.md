---
layout: notebook
lang: es
section: teaching
alt_url: /en/teaching/ai-1/
course_url: /es/cursos/ia-1/
course_title: Inteligencia Artificial 1
title: "Notebook 2: Sentimiento con embeddings"
summary: Clase 9 · Los mismos tweets del notebook 1, ahora representados con embeddings de frases.
notebook: /es/cursos/ia-1/notebooks/02-sentimiento-embeddings.ipynb
---
{% raw %}

En el notebook 1 cada tweet era un vector de TF-IDF: miles de columnas, una por palabra, casi todas en cero. Ahora vamos a usar **embeddings de frases**: un modelo ya entrenado convierte cada tweet en un vector de 768 números, de forma que frases con significado parecido quedan cerca.

Con esos vectores vamos a entrenar la misma regresión logística del notebook 1 y después una pequeña red neuronal. ¿Mejora el accuracy?

Igual que antes, donde aparezca `___` hay que completar el código que falta.

**Antes de empezar:** en Colab conviene activar la GPU (menú *Entorno de ejecución* > *Cambiar tipo de entorno de ejecución* > *GPU*). Sin GPU también funciona, pero calcular los embeddings tarda unos minutos.

## 1. Preparar el entorno y los datos

```python
%pip install -q sentence-transformers
```

```python
import pandas as pd

URL = "https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual/resolve/main/data/spanish"
train = pd.read_json(f"{URL}/train.jsonl", lines=True)
test = pd.read_json(f"{URL}/test.jsonl", lines=True)

NOMBRES = {0: "negativo", 1: "neutral", 2: "positivo"}
print(len(train), "tweets de entrenamiento")
print(len(test), "tweets de prueba")
```

## 2. El modelo de embeddings

Usamos [paraphrase-multilingual-mpnet-base-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2), un modelo entrenado para que frases que dicen lo mismo, incluso en idiomas distintos, tengan vectores parecidos. La primera vez se descarga (alrededor de 1 GB).

```python
from sentence_transformers import SentenceTransformer

modelo_emb = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
```

Para obtener los vectores se usa el método `encode`. Completar:

```python
frases = ["El perro persigue la pelota", "Me senté en un banco de la plaza"]
vectores = modelo_emb.___(frases)

print("Forma:", vectores.shape)
print("Primeros 10 números del primer vector:", vectores[0][:10].round(2))
```

A diferencia de TF-IDF, ninguno de estos números es cero, y por sí solos no significan nada. Lo que importa es qué vectores quedan cerca de cuáles.

## 3. ¿Qué frases se parecen?

Medimos qué tan cerca están dos frases con la **similitud coseno**: cerca de 1 es muy parecidas, cerca de 0 es nada que ver.

```python
from sentence_transformers.util import cos_sim

def similitud(a, b):
    va, vb = modelo_emb.encode([a, b])
    return round(cos_sim(va, vb).item(), 2)
```

Estos son los pares del ejercicio de la clase. ¿El orden coincide con lo que predijeron?

```python
pares = [
    ("El perro persigue la pelota", "Un cachorro corre detrás de la pelota"),
    ("La película me encantó", "La película no me gustó para nada"),
    ("El banco subió las tasas de interés", "Me senté en un banco de la plaza"),
    ("El perro persigue la pelota", "El banco subió las tasas de interés"),
]
for a, b in pares:
    print(similitud(a, b), " ", a, "|", b)
```

Y el problema del principio de la clase: un estudiante busca "olvidé mi clave" en las preguntas frecuentes.

```python
preguntas = [
    "¿Cómo restablezco mi contraseña del portal?",
    "¿Dónde consulto mis calificaciones?",
    "¿Cómo me inscribo a un examen?",
]
for pregunta in preguntas:
    print(similitud("olvidé mi clave", pregunta), " ", pregunta)
```

Probar con un par de frases propias. Algunas ideas: la misma frase en español y en inglés, dos frases con las mismas palabras pero distinto significado, o una frase y su negación.

```python
similitud("___", "___")
```

## 4. Embeddings de todos los tweets

Ahora convertimos cada tweet en un vector. Esta celda es la que más tarda.

```python
X_train = modelo_emb.encode(train["text"].tolist(), show_progress_bar=True)
X_test = modelo_emb.encode(___["text"].tolist(), show_progress_bar=True)

print("Tweets x dimensiones:", X_train.shape)
```

En el notebook 1 cada tweet tenía más de 6000 columnas, casi todas en cero. Ahora tiene 768, y todas tienen información.

## 5. El mismo modelo del notebook 1

Entrenamos la misma regresión logística. Lo único que cambia es cómo representamos el texto, así que cualquier diferencia se debe a los embeddings.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, ConfusionMatrixDisplay

modelo = LogisticRegression(max_iter=1000)
modelo.fit(___, ___])

predicciones = modelo.___(X_test)
print(f"Accuracy: {accuracy_score(test['label'], predicciones):.1%}")
print(classification_report(test["label"], predicciones, target_names=list(NOMBRES.values())))
```

```python
ConfusionMatrixDisplay.from_predictions(
    test["label"], predicciones, display_labels=list(NOMBRES.values()), cmap="Blues"
);
```

Comparar con el accuracy que anotaron en el notebook 1. ¿Cuánto mejoró? ¿Sigue siendo neutral la clase más difícil?

## 6. Otro modelo: una red neuronal

Probemos con una red neuronal pequeña (un MLP, como en la clase 5) en lugar de la regresión logística. Completar con la cantidad de neuronas de la capa oculta, por ejemplo 256.

```python
from sklearn.neural_network import MLPClassifier

red = MLPClassifier(hidden_layer_sizes=(___,), max_iter=500, early_stopping=True, random_state=0)
red.fit(X_train, train["label"])

print(f"Accuracy: {accuracy_score(test['label'], red.predict(X_test)):.1%}")
```

¿Mejoró respecto a la regresión logística? ¿Qué cambió más el resultado: el modelo de clasificación o la forma de representar el texto?

## 7. Probar con frases propias

Las dos frases que el notebook 1 no entendía bien:

```python
def predecir(frase):
    vector = modelo_emb.encode([frase])
    probabilidades = modelo.predict_proba(vector)[0]
    for clase, nombre in NOMBRES.items():
        print(f"{nombre:>9}: {probabilidades[clase]:.0%}")

predecir("Me encantó la película, la recomiendo")
print()
predecir("Bárbaro el recital, re copado")
```

Ahora con una frase propia:

```python
predecir("___")
```

## 8. Para pensar

- Este modelo de embeddings **no fue entrenado para detectar sentimiento**. Fue entrenado para que frases con el mismo significado queden cerca. Aun así, ayuda mucho. ¿Por qué?
- En la sección 3, "me encantó" y "no me gustó para nada" quedaron más cerca que los dos "banco". ¿Es bueno o malo para clasificar sentimiento?

En el notebook 3 vamos a usar un Transformer entrenado **específicamente** para sentimiento en tweets en español.

## Extra (opcional): ver los embeddings

Con PCA (clase 4) podemos bajar los 768 números de cada tweet a 2 y graficarlos. Cada punto es un tweet de prueba, coloreado por su sentimiento real.

```python
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

puntos = PCA(n_components=2).fit_transform(X_test)
for clase, nombre in NOMBRES.items():
    elegidos = test["label"] == clase
    plt.scatter(puntos[elegidos, 0], puntos[elegidos, 1], s=8, alpha=0.6, label=nombre)
plt.legend()
plt.title("Tweets de prueba (PCA de los embeddings)");
```

{% endraw %}
