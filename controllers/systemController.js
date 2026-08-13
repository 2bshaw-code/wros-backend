const { getStatus } = require("../services/statusService");
const { sendSuccess } = require("../utils/response");

const getStatusController = (req, res) => {
  sendSuccess(res, getStatus());
};

const getWeatherController = async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return res.status(400).json({ success: false, error: { message: "Valid latitude and longitude are required" } });
  }

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
    if (!response.ok) throw new Error("Weather service unavailable");
    const weather = await response.json();
    sendSuccess(res, {
      temperature: weather.current.temperature_2m,
      unit: weather.current_units.temperature_2m,
      code: weather.current.weather_code,
    });
  } catch (error) {
    res.status(502).json({ success: false, error: { message: error.message } });
  }
};

module.exports = { getStatusController, getWeatherController };
