
from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from flask_cors import CORS  # Importamos Flask-CORS
import re

app = Flask(__name__)
# Habilitamos CORS para todos los orígenes de forma explícita
CORS(app, origins=["*"], allow_headers=["Content-Type", "Authorization", "Accept"], 
     methods=["GET", "POST", "OPTIONS"], supports_credentials=False)

vader_analyzer = SentimentIntensityAnalyzer()

# 🔧 Funciones de utilidad
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text.strip()

@app.route('/')
def home():
    # Aseguramos que se devuelva un objeto JSON para la comprobación de conexión
    return jsonify({"message": "API de Análisis de Sentimiento funcionando 👋"})

@app.route('/sentiment', methods=['POST'])
def sentiment():
    data = request.get_json()
    text = data.get('text', '')
    model = data.get('model', 'vader').lower()

    if not text:
        return jsonify({'error': 'Texto no recibido'}), 400

    # Limpiamos el texto
    text_clean = clean_text(text)

    # Análisis según el modelo seleccionado
    if model == 'vader':
        # Para VADER utilizamos el analizador completo para obtener más detalles
        scores = vader_analyzer.polarity_scores(text_clean)
        score = scores['compound']
        
        # Ajustamos los umbrales para hacer que concuerde con lo que ves en tu script local
        if score > 0.05:
            label = 'Positivo'
        elif score < -0.05:
            label = 'Negativo'
        else:
            label = 'Neutral'
            
        # Imprimimos detalles para depuración
        print(f"VADER: '{text_clean}' → scores: {scores}, compound: {score:.3f}, label: {label}")
        
    elif model == 'textblob':
        # Para TextBlob obtenemos tanto polaridad como subjetividad
        analysis = TextBlob(text_clean)
        score = analysis.sentiment.polarity
        
        # Ajustamos los umbrales para TextBlob
        if score > 0.05:
            label = 'Positivo'
        elif score < -0.05:
            label = 'Negativo'
        else:
            label = 'Neutral'
            
        print(f"TextBlob: '{text_clean}' → polarity: {score:.3f}, subjectivity: {analysis.sentiment.subjectivity:.3f}, label: {label}")
        
    else:
        return jsonify({'error': 'Modelo no válido'}), 400

    return jsonify({
        'texto': text,
        'modelo': model,
        'score': score,
        'sentimiento': label
    })

if __name__ == '__main__':
    # Especificamos el host como 0.0.0.0 para permitir conexiones desde cualquier dirección
    app.run(host='0.0.0.0', debug=True)
