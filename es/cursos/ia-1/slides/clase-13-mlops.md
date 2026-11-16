# MLOps, LLMOps y GenAIOps

### Del notebook a producción · Inteligencia Artificial 1, FIT - UCU - 2026

<!-- .slide: data-background-color="#ffffff" -->

---

## Hoy

1. MLOps
2. LLMOps y GenAIOps
3. **Observabilidad**
4. Hacia la Prueba Final

---

## Un problema para empezar

El modelo del Caso 1 funciona en el notebook. **¿Y ahora?**

- ¿Cómo lo usa alguien que no abre el notebook? <!-- .element: class="fragment" -->
- ¿Con qué datos lo entrenamos, y podemos repetirlo? <!-- .element: class="fragment" -->
- ¿Cómo sabemos que sigue funcionando dentro de seis meses? <!-- .element: class="fragment" -->
- Si la versión nueva es peor, ¿cómo volvemos a la anterior? <!-- .element: class="fragment" -->

Entrenar el modelo es la parte **más chica** del trabajo. <!-- .element: class="fragment" -->

---

## MLOps

- Ciclo de vida
- Versionado y registro
- Release y rollback
- Monitoreo

<!-- .slide: data-background-color="#4d4d4d" -->

---

## ¿Qué es MLOps?

- Prácticas para llevar modelos a producción **y mantenerlos ahí** de forma confiable y repetible.
- Es **DevOps** (control de versiones, integración y despliegue continuos, monitoreo) aplicado a sistemas que además dependen de **datos** y de un **modelo entrenado**.
- En un sistema real, el código del modelo es una pieza chica rodeada de mucho más: recolección y validación de datos, features, configuración, infraestructura, monitoreo (Sculley et al., *Hidden Technical Debt in Machine Learning Systems*, 2015).
- Un modelo puede **empeorar sin que nadie toque el código**: cambian los datos del mundo.

---

## El ciclo de vida

```text
  datos ──► entrenamiento ──► evaluación ──► registro ──► despliegue
    ▲                                                          │
    │                                                          ▼
    └──────────── reentrenamiento ◄──────────────────── monitoreo
```

- Es un **ciclo**, no una línea: lo que se observa en producción vuelve a alimentar los datos y el entrenamiento.
- Es el mismo espíritu que CRISP-DM (clase 1), pero con el modelo ya funcionando para usuarios reales.

---

## Qué se versiona

Para poder **reproducir** un modelo y **volver atrás** hay que versionar todo lo que lo define:

- **Código**: entrenamiento, preprocesamiento, inferencia (git).
- **Datos**: qué versión del dataset se usó (DVC, snapshots, tablas con fecha).
- **Configuración**: hiperparámetros, semillas, umbrales.
- **Modelo**: el artefacto entrenado, con sus métricas.
- **Entorno**: versiones de librerías, imagen de contenedor.

Con **MLflow** (clase 2): *tracking* registra cada corrida con sus parámetros y métricas; el *model registry* guarda las versiones del modelo y cuál está en producción.

---

## Release y rollback

- **Cómo se sirve**: por lotes (*batch*, ej. scoring nocturno), en línea (una API que responde por pedido) o en el dispositivo (*edge*).
- **Cómo se libera** una versión nueva sin arriesgar todo:
  - **Shadow**: el modelo nuevo recibe el tráfico real pero sus respuestas no se usan; solo se comparan.
  - **Canary**: un pequeño porcentaje de usuarios usa el nuevo; si va bien, se amplía.
  - **A/B**: dos versiones en paralelo, se compara una métrica de negocio.
- **Rollback**: volver a la versión anterior del registro. Solo es fácil si se versionó todo lo de la diapositiva anterior.

---

## Monitoreo

- **Del sistema**: latencia, errores, disponibilidad. Como cualquier servicio.
- **De los datos**: *data drift*, las entradas cambian (nuevos productos, otra estación del año, otro tipo de cliente).
- **Del concepto**: *concept drift*, cambia la relación entre entradas y salida (lo que antes era fraude ya no lo es, o al revés).
- **Del modelo y del negocio**: accuracy, costo del error (clase 3), conversiones.
- Problema práctico: la **etiqueta real llega tarde** (o nunca). Por eso se vigilan los datos de entrada y la distribución de predicciones como señal temprana.

---

## LLMOps y GenAIOps

- Qué cambia con LLMs
- Prompts como código
- Evaluación continua

<!-- .slide: data-background-color="#4d4d4d" -->

---

## ¿Qué cambia con LLMs?

- Casi nunca **entrenamos**: usamos un modelo por API o un modelo abierto ya entrenado.
- El "modelo" de la aplicación es una **combinación**: modelo + prompt + índice de RAG + herramientas + configuración.
- La salida es **texto abierto**: no hay una accuracy única que mirar.
- **No determinismo**: la misma entrada puede dar respuestas distintas.
- **Costo y latencia por token**: un prompt más largo cuesta plata en cada pedido.
- El **proveedor cambia el modelo**: una versión nueva o retirada puede cambiar el comportamiento sin que toquemos nada.

---

## Mismo problema, otro artefacto

<div class="small">

| | MLOps | LLMOps / GenAIOps |
|---|---|---|
| Qué se construye | Un modelo entrenado | Una aplicación sobre un modelo ya entrenado |
| Qué se versiona | Datos, código, modelo | Prompts, modelo y versión, índice RAG, herramientas |
| Cómo se evalúa | Métricas sobre un test set | Evals sobre casos de prueba, a veces con un LLM como juez |
| Qué se monitorea | Drift, accuracy | Calidad, alucinaciones, seguridad, tokens, costo |
| Qué puede empeorar | Cambian los datos | Cambian los datos, el prompt o el modelo del proveedor |

</div>

**LLMOps**, **GenAIOps**, **AgentOps**: nombres que se usan casi como sinónimos. La idea de fondo es la misma de MLOps. <!-- .element: class="fragment" -->

---

## Prompts como código

- Un cambio de prompt es un **release**: puede mejorar un caso y romper otros diez.
- Por eso el prompt vive en el **repositorio** (o en un registro de prompts), con versión, y no pegado a mano en un panel.
- **Fijar la versión del modelo** (ej. `modelo-2026-05-01`, no "el último"), para que el comportamiento no cambie solo.
- Lo mismo para el **índice de RAG**: qué documentos, qué chunking, qué modelo de embeddings (clase 9). Si cambia el modelo de embeddings, hay que reindexar todo.
- Rollback = volver a la combinación anterior de prompt + modelo + índice.

---

## Evaluación continua

- Un **conjunto de evaluación**: preguntas reales con la respuesta esperada o criterios de qué es una buena respuesta.
- Se corre **antes de cada cambio** (prompt, modelo, índice), como los tests de software: si algo que andaba deja de andar, no se libera.
- Cómo puntuar texto abierto:
  - reglas simples (¿cita la fuente?, ¿respeta el formato?),
  - **LLM como juez**, con una rúbrica, y revisado contra el criterio humano,
  - revisión humana de una muestra.
- En agentes se evalúa también la **traza** (clase 11): ¿usó la herramienta correcta?, ¿cuántos pasos?
- En producción: **feedback** de usuarios (👍/👎) y casos que fallan vuelven al conjunto de evaluación.

---

## Observabilidad

- Trazas en producción
- Qué vigilar
- Herramientas

<!-- .slide: data-background-color="#4d4d4d" -->

---

## Monitorear vs observar

- **Monitorear**: saber *que* algo anda mal (la latencia subió, bajó el 👍).
- **Observar**: poder averiguar *por qué*, a partir de lo que el sistema registró.
- En una aplicación con LLM la pieza central es la **traza**, como en el notebook 7: cada pedido queda registrado con todos sus pasos (*spans*).
- Además: **métricas** agregadas (latencia, tokens, costo, errores) y **logs**.

---

## Una traza en producción

```text
pedido 7f3a  "¿Cuándo es la Prueba Final?"         2.4 s  1.840 tokens
├─ recuperar (RAG)    3 fragmentos del programa      0.2 s
│     programa.md#cronograma  (similitud 0.81)
├─ llm  modelo-2026-05-01, prompt v12               1.9 s  1.790 tokens
│     tool_call: dias_hasta("2026-11-23")
├─ herramienta  dias_hasta → 7                       0.0 s
└─ llm  respuesta final                              0.3 s     50 tokens
feedback: 👍
```

Con esto se puede responder: ¿recuperó el fragmento correcto?, ¿qué versión de prompt se usó?, ¿dónde se fue el tiempo?, ¿cuánto costó?

---

## Qué vigilar

- **Calidad**: evals sobre una muestra de pedidos reales, feedback, tasa de "no sé".
- **Seguridad**: intentos de *prompt injection*, datos personales en entradas y salidas, acciones bloqueadas por los guardrails (clase 11).
- **Costo**: tokens por pedido, por usuario, por funcionalidad.
- **Latencia**: tiempo total y tiempo hasta el primer token.
- **Drift**: preguntas nuevas que el índice de RAG no cubre, o cambios de comportamiento tras una versión nueva del modelo.

---

## Herramientas

- Plataformas de trazas y evaluación: **LangSmith**, **Langfuse**, **Arize Phoenix**, **MLflow** (que además de *tracking* incorpora trazas para LLMs).
- **OpenTelemetry**: estándar abierto de observabilidad, con convenciones específicas para aplicaciones de IA generativa; permite no atarse a una herramienta.
- No hace falta memorizarlas: todas registran lo mismo, la **traza** de cada pedido, y permiten evaluarla.

---

## Pregunta (2')

El asistente con RAG del curso empieza a decir que la Prueba Final es el 16 de noviembre. **¿Qué miramos primero?**

- La **traza** de un pedido que falla. <!-- .element: class="fragment" -->
- ¿Se recuperó el fragmento correcto del cronograma? Si no: problema de **recuperación** (¿cambió el documento, el chunking, el índice?). <!-- .element: class="fragment" -->
- Si se recuperó bien: problema de **generación** (¿cambió el prompt?, ¿cambió la versión del modelo?). <!-- .element: class="fragment" -->
- Una vez arreglado: agregar esa pregunta al **conjunto de evaluación**, para que no vuelva a pasar. <!-- .element: class="fragment" -->

---

## Resumen

- **MLOps**: llevar un modelo a producción y mantenerlo; versionar código, datos, configuración y modelo, liberar con cuidado (shadow, canary, A/B), poder hacer **rollback** y **monitorear** el drift.
- **LLMOps / GenAIOps**: lo mismo, pero el artefacto es modelo + **prompt** + índice + herramientas; los prompts se versionan como código y cada cambio se valida con un **conjunto de evaluación**.
- **Observabilidad**: **trazas** de cada pedido, métricas de calidad, costo y latencia, y los fallos de producción vuelven a la evaluación.
