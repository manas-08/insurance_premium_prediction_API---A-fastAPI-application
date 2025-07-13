// InsurancePremiumPredictor.jsx
import React, { useState } from "react"

export default function InsurancePremiumPredictor() {
  const [formData, setFormData] = useState({
        age: 0,
        height: 0,
        weight: 0,
        income_lpa: 0,
        city: "",
        smoker: false,
        occupation: "",
      });

      const [prediction, setPrediction] = useState(null);
      const [loading, setLoading] = useState(false);
      const [errors, setErrors] = useState({});
      const [apiEndpoint, setApiEndpoint] = useState("");
      const [cityOptions, setCityOptions] = useState([]);
      const [showCityDropdown, setShowCityDropdown] = useState(false);
      const [occupationSearch, setOccupationSearch] = useState("");
      const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);

      const occupationOptions = [
        "retired",
        "freelancer",
        "student",
        "government_job",
        "business_owner",
        "unemployed",
        "private_job",
      ];

      const indianCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"];

      const validateForm = () => {
        const newErrors = {};

        if (!formData.age || formData.age <= 0 || formData.age >= 120) newErrors.age = "Age must be between 1 and 119";
        if (!formData.height || formData.height <= 0 || formData.height >= 2.5) newErrors.height = "Height must be between 0 and 2.5 meters";
        if (!formData.weight || formData.weight <= 0) newErrors.weight = "Weight must be greater than 0";
        if (!formData.income_lpa || formData.income_lpa <= 0) newErrors.income_lpa = "Income must be greater than 0";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.occupation) newErrors.occupation = "Occupation is required";
        if (!apiEndpoint.trim()) newErrors.apiEndpoint = "API endpoint is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const filterCities = (searchTerm) => {
        if (!searchTerm.trim()) return [];
        return indianCities.filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10);
      };

      const filterOccupations = (searchTerm) => {
        if (!searchTerm.trim()) return occupationOptions;
        return occupationOptions.filter(
          (occupation) =>
            occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            occupation.replace("_", " ").toLowerCase().includes(searchTerm.toLowerCase())
        );
      };

      const formatOccupationDisplay = (occupation) =>
        occupation.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "city") {
          setFormData((prev) => ({ ...prev, city: value }));
          setCityOptions(filterCities(value));
          setShowCityDropdown(value.length > 0);
        } else if (name === "occupation_search") {
          setOccupationSearch(value);
          setShowOccupationDropdown(true);
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
          }));
        }

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      };

      const handleCitySelect = (city) => {
        setFormData((prev) => ({ ...prev, city }));
        setShowCityDropdown(false);
        setCityOptions([]);
        if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
      };

      const handleOccupationSelect = (occupation) => {
        setFormData((prev) => ({ ...prev, occupation }));
        setOccupationSearch(formatOccupationDisplay(occupation));
        setShowOccupationDropdown(false);
        if (errors.occupation) setErrors((prev) => ({ ...prev, occupation: "" }));
      };

      const handleClickOutside = (e) => {
        const target = e.target;
        if (!target.closest(".city-autocomplete") && !target.closest(".occupation-autocomplete")) {
          setShowCityDropdown(false);
          setShowOccupationDropdown(false);
        }
      };

      const calculateDerivedFields = () => {
        const bmi = formData.height > 0 ? formData.weight / (formData.height ** 2) : 0;
        const age_group = formData.age < 25 ? "Young" : formData.age < 45 ? "Adult" : formData.age < 60 ? "Middle-aged" : "Senior";
        const lifestyle_risk = formData.smoker && bmi > 30 ? "High" : formData.smoker || bmi > 30 ? "Medium" : "Low";
        const city_category = ["Mumbai", "Delhi"].includes(formData.city) ? "Tier 1" : ["Bangalore", "Hyderabad"].includes(formData.city) ? "Tier 2" : "Tier 3";

        return {
          bmi: parseFloat(bmi.toFixed(2)),
          age_group,
          lifestyle_risk,
          city_category,
          occupation: formData.occupation,
          income_lpa: formData.income_lpa,
        };
      };

      const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setPrediction(null);

    try {
        // Send raw form data
        const payload = {
            age: formData.age,
            height: formData.height,
            weight: formData.weight,
            city: formData.city,
            smoker: formData.smoker,
            occupation: formData.occupation,
            income_lpa: formData.income_lpa,
        };
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        setPrediction(result);
    } catch (error) {
        console.error("Error making prediction:", error);
        setErrors({ api: error.message || "Failed to get prediction. Please check your API endpoint and try again." });
    } finally {
        setLoading(false);
    }
};

      const resetForm = () => {
        setFormData({ age: 0, height: 0, weight: 0, income_lpa: 0, city: "", smoker: false, occupation: "" });
        setPrediction(null);
        setErrors({});
        setCityOptions([]);
        setShowCityDropdown(false);
        setOccupationSearch("");
        setShowOccupationDropdown(false);
      };

      const getPredictionColor = (category) => {
        switch (category.toLowerCase()) {
          case "high": return "text-red-600 bg-red-50 border-red-200";
          case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
          case "low": return "text-green-600 bg-green-50 border-green-200";
          default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
      };

      return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8" onClick={handleClickOutside}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Premium Predictor</h1>
                <p className="text-gray-600">Enter your details to predict your insurance premium category</p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label htmlFor="apiEndpoint" className="block text-sm font-medium text-blue-900 mb-2">
                  API Endpoint URL
                </label>
                <input
                  type="url"
                  id="apiEndpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://your-api-endpoint.com/predict"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.apiEndpoint && <p className="mt-1 text-sm text-red-600">{errors.apiEndpoint}</p>}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age || ""}
                      onChange={handleInputChange}
                      min="1"
                      max="119"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your age"
                    />
                    {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                  </div>

                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                      Height (meters) *
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height || ""}
                      onChange={handleInputChange}
                      min="0.1"
                      max="2.4"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 1.75"
                    />
                    {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
                  </div>

                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight || ""}
                      onChange={handleInputChange}
                      min="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your weight"
                    />
                    {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                  </div>

                  <div>
                    <label htmlFor="income_lpa" className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Income (LPA) *
                    </label>
                    <input
                      type="number"
                      id="income_lpa"
                      name="income_lpa"
                      value={formData.income_lpa || ""}
                      onChange={handleInputChange}
                      min="0.1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 5.5"
                    />
                    {errors.income_lpa && <p className="mt-1 text-sm text-red-600">{errors.income_lpa}</p>}
                  </div>

                  <div className="relative city-autocomplete">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (formData.city) {
                          setCityOptions(filterCities(formData.city));
                          setShowCityDropdown(true);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Start typing your city name..."
                      autoComplete="off"
                    />
                    {showCityDropdown && cityOptions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {cityOptions.map((city, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleCitySelect(city)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div className="relative occupation-autocomplete">
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation *
                    </label>
                    <input
                      type="text"
                      id="occupation_search"
                      name="occupation_search"
                      value={occupationSearch || (formData.occupation ? formatOccupationDisplay(formData.occupation) : "")}
                      onChange={handleInputChange}
                      onFocus={() => setShowOccupationDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search or select your occupation..."
                      autoComplete="off"
                    />
                    {showOccupationDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filterOccupations(occupationSearch).map((occupation, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleOccupationSelect(occupation)}
                            className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                              formData.occupation === occupation ? "bg-blue-100 font-medium" : ""
                            }`}
                          >
                            {formatOccupationDisplay(occupation)}
                            {occupation === "government_job" && (
                              <span className="text-xs text-gray-500 ml-2">(Govt. Employee)</span>
                            )}
                            {occupation === "business_owner" && (
                              <span className="text-xs text-gray-500 ml-2">(Entrepreneur)</span>
                            )}
                            {occupation === "private_job" && (
                              <span className="text-xs text-gray-500 ml-2">(Corporate)</span>
                            )}
                          </button>
                        ))}
                        {filterOccupations(occupationSearch).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No occupations found. Please select from available options.
                          </div>
                        )}
                      </div>
                    )}
                    {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="smoker"
                    name="smoker"
                    checked={formData.smoker}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smoker" className="text-sm font-medium text-gray-700">
                    I am a smoker
                  </label>
                </div>

                {errors.api && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.api}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Predicting...
                      </span>
                    ) : (
                      "Predict Premium Category"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {prediction && (
                <div className="mt-8 p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Result</h3>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full border font-medium ${getPredictionColor(prediction.predicted_category)}`}
                  >
                    <span className="text-sm">Premium Category: </span>
                    <span className="ml-2 text-lg font-bold">{prediction.predicted_category.toUpperCase()}</span>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      <strong>BMI:</strong>{" "}
                      {formData.height > 0 ? (formData.weight / formData.height ** 2).toFixed(2) : "N/A"}
                    </p>
                    <p className="mt-1">
                      <strong>Age Group:</strong>{" "}
                      {formData.age < 25
                        ? "Young"
                        : formData.age < 45
                          ? "Adult"
                          : formData.age < 60
                            ? "Middle-aged"
                            : "Senior"}
                    </p>
                    <p className="mt-1">
                      <strong>Lifestyle Risk:</strong>{" "}
                      {formData.smoker && formData.weight / formData.height ** 2 > 30
                        ? "High"
                        : formData.smoker || formData.weight / formData.height ** 2 > 30
                          ? "Medium"
                          : "Low"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
}
