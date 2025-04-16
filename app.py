
from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from flask_cors import CORS  # Importamos Flask-CORS

app = Flask(__name__)
# Habilitamos CORS para todos los orígenes de forma explícita
CORS(app, origins=["*"], allow_headers=["Content-Type", "Authorization", "Accept"], 
     methods=["GET", "POST", "OPTIONS"], supports_credentials=False)

vader_analyzer = SentimentIntensityAnalyzer()

@app.route('/')
def home():
    # Aseguramos que se devuelva un objeto JSON para la comprobación de conexión
    return jsonify({"message": "API de Análisis de Sentimiento funcionando 👋"})

@app.route('/sentiment', methods=['POST'])
def sentiment():
    data = request.get_json()
    text = data.get('text')
    model = data.get('model', 'vader').lower()

    if not text:
        return jsonify({'error': 'Texto no recibido'}), 400

    # Análisis según el modelo seleccionado
    if model == 'vader':
        # Para VADER utilizamos el analizador completo para obtener más detalles
        scores = vader_analyzer.polarity_scores(text)
        score = scores['compound']
        
        # Añadimos los detalles del análisis en la respuesta
        print(f"VADER scores: {scores}")
        
    elif model == 'textblob':
        # Para TextBlob obtenemos tanto polaridad como subjetividad
        analysis = TextBlob(text)
        score = analysis.sentiment.polarity
        
        # Añadimos los detalles del análisis en la respuesta
        print(f"TextBlob polarity: {score}, subjectivity: {analysis.sentiment.subjectivity}")
        
    else:
        return jsonify({'error': 'Modelo no válido'}), 400

    # Determinamos la etiqueta de sentimiento
    # Ajustamos los umbrales para obtener más variedad en las etiquetas
    if score > 0.05:
        label = 'Positivo'
    elif score < -0.05:
        label = 'Negativo'
    else:
        label = 'Neutral'

    # Imprimimos para depuración
    print(f"Texto: '{text}', Modelo: {model}, Score: {score}, Sentimiento: {label}")

    return jsonify({
        'texto': text,
        'modelo': model,
        'score': score,
        'sentimiento': label
    })

if __name__ == '__main__':
    # Especificamos el host como 0.0.0.0 para permitir conexiones desde cualquier dirección
    app.run(host='0.0.0.0', debug=True)
