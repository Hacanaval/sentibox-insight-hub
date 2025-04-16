
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

    if model == 'vader':
        score = vader_analyzer.polarity_scores(text)['compound']
    elif model == 'textblob':
        score = TextBlob(text).sentiment.polarity
    else:
        return jsonify({'error': 'Modelo no válido'}), 400

    if score > 0.05:
        label = 'Positivo'
    elif score < -0.05:
        label = 'Negativo'
    else:
        label = 'Neutral'

    return jsonify({
        'texto': text,
        'modelo': model,
        'score': score,
        'sentimiento': label
    })

if __name__ == '__main__':
    # Especificamos el host como 0.0.0.0 para permitir conexiones desde cualquier dirección
    app.run(host='0.0.0.0', debug=True)
