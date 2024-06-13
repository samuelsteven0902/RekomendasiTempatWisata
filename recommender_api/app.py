from flask import Flask, request, jsonify
import coremltools
import pandas as pd
from flask_cors import CORS  # Import modul CORS

app = Flask(__name__)
CORS(app)

# Muat model .mlmodel
model = coremltools.models.MLModel('PlaceRecommenderbyRating.mlmodel')

# Muat data dari file CSV
csv_file_path = 'tourism_with_id.csv'  # Ganti dengan path ke file CSV Anda
dataframe = pd.read_csv(csv_file_path)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Sesuaikan data input sesuai dengan kebutuhan model
        input_data = {
            "items": {
                data['Item']: data['Rating']
            },
            "k": 5,
        }
        
        # Prediksi menggunakan model Core ML
        prediction = model.predict(input_data)
        
        # Ambil rekomendasi ID dari hasil prediksi
        recommendations = prediction.get('recommendations', [])
        scores = prediction.get('scores', {})
        
        # Cari detail ID di dalam file CSV
        result = {}
        for rec_id, score in scores.items():
            detail = dataframe.loc[dataframe['Place_Id'] == rec_id].to_dict(orient='records')
            if detail:
                result[rec_id] = {
                    'detail': detail[0],
                    'probability': score
                }

        return jsonify(result)
    
    except Exception as e:
        return jsonify(result), 400

if __name__ == '__main__':
    app.run(debug=True)
