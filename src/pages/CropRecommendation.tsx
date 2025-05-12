import { useState } from 'react';
import { Leaf, ArrowRight, Ruler, CloudRain, MapPin } from 'lucide-react';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    rainfall: '',
    city: ''
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    crop: string;
    weather: { temperature: number; humidity: number; location: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/predict-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nitrogen: Number(formData.nitrogen),
          phosphorus: Number(formData.phosphorus),
          potassium: Number(formData.potassium),
          ph: Number(formData.ph),
          rainfall: Number(formData.rainfall),
          city: formData.city
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.crop) throw new Error('Invalid response data');

      setRecommendation({
        crop: data.crop,
        weather: {
          temperature: data.weather.temperature,
          humidity: data.weather.humidity,
          location: data.weather.location
        }
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      ph: '',
      rainfall: '',
      city: ''
    });
    setRecommendation(null);
    setError(null);
  };

  const cropInformation: Record<string, any> = {
    rice: {
      description: 'Rice thrives in warm, humid conditions with ample water.',
      season: 'Kharif (Monsoon)',
      water: 'High',
      growth: '3-6 months',
      yield: '3-5 tons/hectare'
    },
    wheat: {
      description: 'Wheat grows best in moderate temperatures.',
      season: 'Rabi (Winter)',
      water: 'Medium',
      growth: '4-5 months',
      yield: '2.5-3.5 tons/hectare'
    },
    maize: {
      description: 'Maize requires warm conditions and moderate rainfall.',
      season: 'Kharif/Rabi',
      water: 'Medium',
      growth: '3-4 months',
      yield: '4-6 tons/hectare'
    },
    mango: {
      description: 'Tropical fruit needing subtropical climate.',
      season: 'Summer',
      water: 'Medium',
      growth: '5-8 years',
      yield: '10-15 tons/hectare'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Recommendation</h1>
        <p className="text-gray-600">
          Get personalized crop suggestions based on soil nutrients and live weather.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 border p-6 rounded-xl shadow-sm bg-white space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'nitrogen', label: 'Nitrogen (kg/ha)', icon: Leaf },
                { name: 'phosphorus', label: 'Phosphorus (kg/ha)', icon: Leaf },
                { name: 'potassium', label: 'Potassium (kg/ha)', icon: Leaf },
                { name: 'ph', label: 'Soil pH', icon: Ruler },
                { name: 'rainfall', label: 'Rainfall (mm)', icon: CloudRain },
                { name: 'city', label: 'City', icon: MapPin }
              ].map(({ name, label, icon: Icon }) => (
                <div key={name}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                    <Icon className="w-4 h-4" />
                    {label}
                  </label>
                  <input
                    type={name === 'city' ? 'text' : 'number'}
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder={label}
                    min={name === 'ph' ? 3 : 0}
                    step={name === 'ph' ? 0.1 : 1}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Analyzing...' : (
                  <div className="flex items-center gap-2">
                    Get Recommendation
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Result Section */}
        <div className="border p-6 rounded-xl shadow-sm bg-white h-fit space-y-6">
          <h2 className="text-xl font-semibold mb-2">Recommendation</h2>

          {recommendation ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold capitalize text-green-700">{recommendation.crop}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {cropInformation[recommendation.crop]?.description || 'Great choice for your conditions.'}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Weather:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>🌡️ Temp: {recommendation.weather.temperature}°C</li>
                  <li>💧 Humidity: {recommendation.weather.humidity}%</li>
                  <li>📍 Location: {recommendation.weather.location}</li>
                </ul>
              </div>

              {cropInformation[recommendation.crop] && (
                <div>
                  <h4 className="font-medium mt-4">Crop Details:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>🗓️ Season: {cropInformation[recommendation.crop].season}</li>
                    <li>🚿 Water Needs: {cropInformation[recommendation.crop].water}</li>
                    <li>⏳ Growth: {cropInformation[recommendation.crop].growth}</li>
                    <li>🌾 Yield: {cropInformation[recommendation.crop].yield}</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Enter values and submit to get a crop recommendation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
