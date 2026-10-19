---
layout: notebook
lang: es
section: teaching
alt_url: /en/teaching/ai-1/
course_url: /es/cursos/ia-1/
course_title: Inteligencia Artificial 1
title: "Notebook 3: Cómo genera un LLM"
summary: Clase 10 · Probabilidades del siguiente token, generación de a un token, temperatura y alucinaciones con un LLM chico.
notebook: /es/cursos/ia-1/notebooks/03-como-genera-un-llm.ipynb
---
{% raw %}

Un LLM hace una sola cosa: dado un texto, calcula la probabilidad de cada token posible como **siguiente token**. Todo lo demás (responder, resumir, conversar) sale de repetir eso muchas veces.

En este notebook vamos a mirar esas probabilidades de cerca, generar texto de a un token, ver qué hace la temperatura y preguntarle al modelo cosas que no puede saber.

Usamos [Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct), un modelo chico (1.500 millones de parámetros) que entra en Colab. Los modelos que usan ChatGPT o Claude son mucho más grandes, pero funcionan igual.

Donde aparezca `___` hay que completar el código que falta.

**Antes de empezar:** activar la GPU (menú *Entorno de ejecución* > *Cambiar tipo de entorno de ejecución* > *GPU*). Sin GPU funciona, pero cada respuesta tarda bastante más.

## 1. Cargar el modelo

La primera vez se descarga (alrededor de 3 GB). El tokenizer y el modelo van siempre juntos: el modelo solo entiende los tokens de **su** tokenizer.

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

DISPOSITIVO = "cuda" if torch.cuda.is_available() else "cpu"
NOMBRE = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(NOMBRE)
modelo = AutoModelForCausalLM.from_pretrained(
    NOMBRE, dtype=torch.float16 if DISPOSITIVO == "cuda" else torch.float32
).to(DISPOSITIVO)

print("Usando:", DISPOSITIVO)
print(f"Parámetros: {modelo.num_parameters():,}")
print(f"Tokens en el vocabulario: {len(tokenizer):,}")
```

## 2. Repaso: el texto se parte en tokens

Como vimos en la clase 9, el modelo no ve letras ni palabras, sino tokens. La `Ġ` marca un espacio al principio del token.

```python
texto = "La capital de Uruguay es"
print(tokenizer.tokenize(texto))
print(tokenizer.encode(texto))
```

## 3. Las probabilidades del siguiente token

Le pasamos el texto al modelo y nos devuelve un número (*logit*) por cada token del vocabulario. Con **softmax** (la misma función de la clase 5) esos números se convierten en probabilidades que suman 1. Completar:

```python
import pandas as pd

def probabilidades(texto):
    ids = tokenizer(texto, return_tensors="pt").to(DISPOSITIVO)
    with torch.no_grad():
        logits = modelo(**ids).logits[0, -1].float()
    return torch.___(logits, dim=-1)

def siguiente_token(texto, n=10):
    p = probabilidades(texto)
    mejores = torch.topk(p, n)
    return pd.DataFrame({
        "token": [repr(tokenizer.decode(i)) for i in mejores.indices],
        "probabilidad": mejores.values.cpu().numpy().round(3),
    })

siguiente_token("La capital de Uruguay es")
```

¿Es "Montevideo" lo más probable? ¿Por qué tienen tanta probabilidad tokens como " la" o " una"?

Probar con otros comienzos de frase. Algunas ideas: "El mate se toma con", "Mi comida favorita es", "2 + 2 =".

```python
siguiente_token("___")
```

## 4. Generar de a un token

Generar texto es repetir: calcular las probabilidades, elegir un token, agregarlo al texto y volver a empezar. Si siempre elegimos el **más probable**, se llama generación *greedy*.

Completar con la función de PyTorch que devuelve la posición del valor más grande.

```python
texto = "La capital de Uruguay es"
for paso in range(10):
    p = probabilidades(texto)
    elegido = torch.___(p).item()
    texto += tokenizer.decode(elegido)
    print(f"{p[elegido].item():.2f}  {texto}")
```

El modelo nunca "pensó" la oración completa: la fue armando de a un token, sin poder volver atrás.

## 5. La temperatura

Antes del softmax, los logits se dividen por la **temperatura**. Con temperatura baja la probabilidad se concentra en el token más probable. Con temperatura alta se reparte entre muchos tokens.

```python
def con_temperatura(texto, temperatura, n=6):
    ids = tokenizer(texto, return_tensors="pt").to(DISPOSITIVO)
    with torch.no_grad():
        logits = modelo(**ids).logits[0, -1].float()
    p = torch.softmax(logits / temperatura, dim=-1)
    mejores = torch.topk(p, n)
    return {tokenizer.decode(i): round(v.item(), 3) for v, i in zip(mejores.values, mejores.indices)}

for t in [0.2, 1.0, 2.0]:
    print(f"temperatura {t}:", con_temperatura("Mi comida favorita es", t))
```

Ahora generamos varias veces con el mismo pedido, **sorteando** el token según esas probabilidades (`do_sample=True`). Para eso conviene usar `generate`, que hace el bucle de la sección 4 por nosotros.

```python
def generar(texto, temperatura, max_tokens=15):
    ids = tokenizer(texto, return_tensors="pt").to(DISPOSITIVO)
    salida = modelo.generate(
        **ids, do_sample=True, temperature=temperatura, max_new_tokens=max_tokens,
        pad_token_id=tokenizer.eos_token_id,
    )
    return tokenizer.decode(salida[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)

inicio = "Un buen nombre para una heladería en Montevideo es"
for i in range(3):
    print("temperatura 0.1:", generar(inicio, 0.1))
print()
for i in range(3):
    print("temperatura 1.5:", generar(inicio, 1.5))
```

Probar con otra temperatura. ¿A partir de qué valor el texto empieza a perder sentido?

```python
for i in range(3):
    print(generar(inicio, ___))
```

## 6. El chat también es texto

Cuando usamos un chat, cada mensaje tiene un **rol**: `system` (instrucciones generales), `user` (lo que escribimos) y `assistant` (lo que responde el modelo). Antes de entrar al modelo, la conversación se convierte en un único texto con tokens especiales. Completar con el rol de nuestro mensaje:

```python
mensajes = [
    {"role": "system", "content": "Sos el asistente de la materia Inteligencia Artificial 1."},
    {"role": "___", "content": "¿Cuándo es el Parcial 2?"},
]
print(tokenizer.apply_chat_template(mensajes, add_generation_prompt=True, tokenize=False))
```

El modelo continúa a partir de `<|im_start|>assistant`. Es la misma tarea de siempre, predecir el siguiente token, con un formato que aprendió durante el ajuste por instrucciones.

Esta función arma ese texto, genera la respuesta y devuelve solo la parte nueva. La vamos a usar en lo que queda del notebook.

```python
def preguntar(pregunta, sistema=None, max_tokens=150):
    mensajes = [{"role": "system", "content": sistema}] if sistema else []
    mensajes.append({"role": "user", "content": pregunta})
    ids = tokenizer.apply_chat_template(
        mensajes, add_generation_prompt=True, return_tensors="pt", return_dict=True
    ).to(DISPOSITIVO)
    salida = modelo.generate(**ids, do_sample=False, max_new_tokens=max_tokens)
    return tokenizer.decode(salida[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)

print(preguntar("¿Cuál es la capital de Uruguay?"))
```

## 7. ¿Qué sabe y qué inventa?

El modelo nunca vio el programa de Inteligencia Artificial 1. Veamos qué hace si le preguntamos por él.

```python
print(preguntar("¿Cuántos puntos vale la Prueba Final de Inteligencia Artificial 1 en la UCU?"))
```

Puede que diga que no sabe. Pero fijarse bien: ¿qué universidad cree que es la UCU?

Ahora lo obligamos a responder corto, sin dejarle lugar para excusas:

```python
print(preguntar(
    "Respondé solo con un número, sin explicaciones. ¿Cuántos puntos sobre 100 vale "
    "la Prueba Final de Inteligencia Artificial 1 en la Universidad Católica del Uruguay?"
))
```

Según el programa del curso, vale 35. El modelo respondió un número con total seguridad, aunque no tiene forma de saberlo.

Otra pregunta que vimos en la clase. Como el modelo tiene que *continuar* la frase, algo va a inventar:

```python
print(preguntar(
    "Completá la frase, sin explicaciones: En Inteligencia Artificial 1 de la "
    "Universidad Católica del Uruguay, si me va mal en el Parcial 1...",
    max_tokens=60,
))
```

Y una que parece fácil pero no lo es para un modelo que ve tokens y no letras:

```python
print(preguntar("¿Cuántas letras r tiene la palabra ferrocarril?"))
```

Hacerle una pregunta propia: algo reciente, algo muy local o algo que solo ustedes saben. ¿Dice que no sabe o inventa?

```python
print(preguntar("___"))
```

## 8. Para pensar

- En la sección 3, "Montevideo" no era el token más probable, pero la generación igual llegó ahí. ¿Por qué?
- Para clasificar tweets, ¿usarían temperatura alta o baja? ¿Y para inventar nombres de heladerías?
- El modelo inventó datos del curso con total seguridad. ¿Qué información habría que darle para que responda bien? ¿Dónde se la daríamos?

En el notebook 4 vamos a usar este mismo modelo para clasificar los tweets de la clase 9, sin entrenarlo. En el notebook 5 le vamos a dar el programa del curso.

{% endraw %}
