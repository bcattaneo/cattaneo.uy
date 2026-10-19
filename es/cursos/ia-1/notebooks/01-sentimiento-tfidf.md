---
layout: notebook
lang: es
section: teaching
alt_url: /en/teaching/ai-1/
course_url: /es/cursos/ia-1/
course_title: Inteligencia Artificial 1
title: "Notebook 1: Sentimiento con TF-IDF"
summary: Clase 9 · Un primer clasificador de sentimiento para tweets en español, con bolsa de palabras y regresión logística.
notebook: /es/cursos/ia-1/notebooks/01-sentimiento-tfidf.ipynb
---
{% raw %}

Vamos a entrenar un primer clasificador de sentimiento para tweets en español. La idea es simple: convertir cada tweet en un vector de números con **TF-IDF** y entrenar una **regresión logística** sobre esos vectores.

Donde aparezca `___` hay que completar el código que falta. Si una celda da error, lo primero es revisar que no haya quedado ningún `___` sin completar.

Los datos son la parte en español de [Tweet Sentiment Multilingual](https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual). Cada tweet tiene una etiqueta: negativo, neutral o positivo.

## 1. Cargar los datos

```python
import pandas as pd

URL = "https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual/resolve/main/data/spanish"
train = pd.read_json(f"{URL}/train.jsonl", lines=True)
test = pd.read_json(f"{URL}/test.jsonl", lines=True)

NOMBRES = {0: "negativo", 1: "neutral", 2: "positivo"}
train["sentimiento"] = train["label"].map(NOMBRES)
test["sentimiento"] = test["label"].map(NOMBRES)

print(len(train), "tweets de entrenamiento")
print(len(test), "tweets de prueba")
train.sample(10, random_state=0)
```

¿Cuántos tweets hay de cada clase? Completar con el nombre de la columna que tiene la etiqueta en texto.

```python
train___].value_counts()
```

Las tres clases tienen la misma cantidad de tweets. Un modelo que responde al azar acierta 1 de cada 3 veces (33%). Ese es el piso a superar.

## 2. Del texto a números: bolsa de palabras

Antes de usar todos los tweets, veamos qué hace un vectorizador con tres frases cortas. Cada fila es una frase y cada columna es una palabra del vocabulario.

```python
from sklearn.feature_extraction.text import CountVectorizer

frases = [
    "el perro come carne",
    "el gato come pescado",
    "el auto usa gasolina",
]
contador = CountVectorizer()
X_frases = contador.___(frases)
pd.DataFrame(X_frases.toarray(), columns=contador.get_feature_names_out(), index=frases)
```

Agregar una frase propia a la lista y volver a ejecutar. ¿Qué pasa con las columnas? ¿Se guarda el orden de las palabras?

## 3. TF-IDF sobre todos los tweets

TF-IDF es parecido, pero le da menos peso a las palabras que aparecen en casi todos los tweets ("de", "que", "el") y más peso a las que aparecen en pocos.

El vocabulario se aprende solo con los tweets de entrenamiento (`fit_transform`). Los de prueba solo se transforman (`transform`), como si fueran tweets nuevos que el modelo nunca vio.

```python
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizador = TfidfVectorizer()
X_train = vectorizador.fit_transform(train["text"])
X_test = vectorizador.___(test["text"])

print("Tweets x palabras:", X_train.shape)
print(f"Valores distintos de cero: {X_train.nnz / (X_train.shape[0] * X_train.shape[1]):.2%}")
```

Cada tweet es un vector de miles de dimensiones, pero casi todos sus valores son cero. Así se ve uno por dentro (solo las palabras que tiene):

```python
i = 2
print(train["text"][i])
vector = pd.Series(X_train[i].toarray()[0], index=vectorizador.get_feature_names_out())
vector[vector > 0].sort_values(ascending=False)
```

## 4. Entrenar el modelo

Usamos regresión logística, el mismo modelo de clasificación de la clase 3. Recibe los vectores de entrenamiento y sus etiquetas (`train["label"]`).

```python
from sklearn.linear_model import LogisticRegression

modelo = LogisticRegression(max_iter=1000)
modelo.fit(___, ___])
```

## 5. Evaluar

```python
from sklearn.metrics import accuracy_score, classification_report, ConfusionMatrixDisplay

predicciones = modelo.___(X_test)

print(f"Accuracy: {accuracy_score(test['label'], predicciones):.1%}")
print(classification_report(test["label"], predicciones, target_names=list(NOMBRES.values())))
```

```python
ConfusionMatrixDisplay.from_predictions(
    test["label"], predicciones, display_labels=list(NOMBRES.values()), cmap="Blues"
);
```

- ¿Supera al azar (33%)?
- ¿Qué clase es la más difícil? ¿Con cuál se confunde más?

Anotar el accuracy: lo vamos a comparar con los notebooks 2 y 4.

## 6. ¿Qué aprendió el modelo?

La regresión logística tiene un peso para cada palabra en cada clase. Las palabras con más peso son las que más empujan la predicción hacia esa clase.

```python
palabras = vectorizador.get_feature_names_out()

def palabras_clave(clase, n=15):
    pesos = modelo.coef_[clase]
    mejores = pesos.argsort()[::-1][:n]
    return ", ".join(palabras[mejores])

for clase, nombre in NOMBRES.items():
    print(f"{nombre}: {palabras_clave(clase)}\n")
```

¿Tienen sentido? ¿Aparece alguna palabra sorprendente?

## 7. Probar con frases propias

```python
def predecir(frase):
    vector = vectorizador.transform([frase])
    probabilidades = modelo.predict_proba(vector)[0]
    for clase, nombre in NOMBRES.items():
        print(f"{nombre:>9}: {probabilidades[clase]:.0%}")

predecir("Qué día tan bonito, estoy muy feliz")
```

Escribir una frase propia. Algunas ideas: una negación ("no está nada mal"), ironía ("qué buen servicio, solo tardaron tres horas") o algo claramente positivo como "Me encantó la película, la recomiendo". ¿El modelo acierta?

```python
predecir("___")
```

El modelo solo conoce las palabras que vio durante el entrenamiento. Las demás simplemente no existen para él:

```python
def palabras_conocidas(frase):
    analizar = vectorizador.build_analyzer()
    for palabra in analizar(frase):
        estado = "conocida" if palabra in vectorizador.vocabulary_ else "desconocida"
        print(f"{palabra:>12}: {estado}")

frase = "Bárbaro el recital, re copado"
palabras_conocidas(frase)
predecir(frase)
```

## 8. Para pensar

- Para este modelo, "bueno" y "excelente" son dos columnas distintas, sin ninguna relación entre ellas. ¿Qué problema trae eso?
- ¿Qué pasa con el orden de las palabras? ¿Cómo distingue "no es bueno, es malo" de "no es malo, es bueno"?

En el notebook 2 vamos a cambiar TF-IDF por **embeddings**, que sí capturan algo del significado.

## Reto (opcional)

En lugar de palabras, TF-IDF puede usar pedacitos de 2 a 5 letras, parecido a los sub-tokens que vimos en la clase. Así, "copado" y "copada" comparten casi todos sus pedacitos. ¿Mejora el accuracy?

```python
vectorizador_letras = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5))
X_train_letras = vectorizador_letras.fit_transform(train["text"])
X_test_letras = vectorizador_letras.transform(test["text"])

modelo_letras = LogisticRegression(max_iter=1000).fit(X_train_letras, train["label"])
print(f"Accuracy: {accuracy_score(test['label'], modelo_letras.predict(X_test_letras)):.1%}")
```

{% endraw %}
