import { Cloud, CloudRain, Crosshair, Droplets, ThermometerSun, Wind } from "lucide-react";
import type { CurrentLocationWeather, DailyWeatherUpdate } from "@/types/monsoon";

export function WeatherUpdate({
  weather,
  location,
  currentLocation,
  locationStatus,
  onUseCurrentLocation,
}: {
  weather?: DailyWeatherUpdate[];
  location: string;
  currentLocation?: CurrentLocationWeather;
  locationStatus?: string;
  onUseCurrentLocation?: () => void;
}) {
  const usingPanchayat = Boolean(weather?.length);
  const forecast = usingPanchayat ? weather : currentLocation?.weather;
  const today = usingPanchayat
    ? weather?.[0]
    : (currentLocation?.current ?? currentLocation?.weather[0]);
  const condition = !today
    ? "Waiting for forecast"
    : today.rainfallMm >= 2
      ? "Rain likely"
      : today.humidityPercent >= 80
        ? "Cloudy"
        : "Mostly dry";
  const Icon = today?.rainfallMm && today.rainfallMm >= 2 ? CloudRain : Cloud;
  const dateLabel =
    today && "date" in today
      ? new Intl.DateTimeFormat("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "short",
        }).format(new Date(`${today.date}T12:00:00`))
      : currentLocation
        ? "Your current location · live public weather"
        : "Allow location access or select a Panchayat";

  return (
    <section
      aria-labelledby="weather-update-title"
      className="relative overflow-hidden rounded-3xl border border-white/30 bg-[#092b58] text-white shadow-xl shadow-primary/10"
    >
      <img
        src="/images/farm-advice-hero.png"
        alt="Farm landscape"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071e40]/90 via-[#092b58]/55 to-[#071e40]/20" />
      <div className="relative p-5 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-200">
              {usingPanchayat ? "Current weather · live" : "Your current weather · live"}
            </p>
            <h2 id="weather-update-title" className="mt-1 text-2xl font-extrabold tracking-tight">
              {usingPanchayat
                ? `${location} Panchayat`
                : (currentLocation?.locationLabel ?? "Your current location")}
            </h2>
            <p className="mt-1 text-sm font-medium text-white/80">{dateLabel}</p>
          </div>
          {!usingPanchayat && onUseCurrentLocation && (
            <button
              onClick={onUseCurrentLocation}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-xs font-extrabold text-white backdrop-blur hover:bg-white/25"
            >
              <Crosshair className="size-4" />
              Use my current location
            </button>
          )}
        </div>
        {!usingPanchayat && locationStatus && (
          <p className="mt-3 text-xs font-medium text-white/75">{locationStatus}</p>
        )}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex items-center gap-5">
            <span className="grid size-20 shrink-0 place-items-center rounded-3xl border border-white/30 bg-white/15 text-white backdrop-blur">
              <Icon className="size-11 stroke-[1.5]" />
            </span>
            <div>
              <p className="text-5xl font-extrabold tracking-tighter">
                {today ? `${today.temperatureC.toFixed(0)}°C` : "—°C"}
              </p>
              <p className="mt-1 text-lg font-extrabold">{condition}</p>
              <p className="text-sm text-white/80">
                Rain today:{" "}
                <strong className="text-white">
                  {today ? `${today.rainfallMm.toFixed(1)} mm` : "—"}
                </strong>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/25 bg-white/15 p-3 backdrop-blur-md">
            <Metric
              icon={Droplets}
              label="Humidity"
              value={today ? `${today.humidityPercent.toFixed(0)}%` : "—"}
            />
            <Metric
              icon={Wind}
              label="Wind"
              value={today ? `${today.windSpeedMs.toFixed(1)} m/s` : "—"}
            />
            <Metric
              icon={ThermometerSun}
              label="Range"
              value={today ? `${today.temperatureC.toFixed(0)}°C` : "—"}
            />
          </div>
        </div>
        <div className="mt-6 border-t border-white/25 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold">Next 5 days forecast</h3>
              <p className="text-xs text-white/75">
                {usingPanchayat
                  ? "Panchayat-adjusted rainfall with weather details"
                  : "Weather forecast for your current location"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(forecast ?? Array.from({ length: 5 })).slice(0, 5).map((day, index) => {
              const item = day as DailyWeatherUpdate | undefined;
              const DayIcon = item && item.rainfallMm >= 2 ? CloudRain : Cloud;
              return (
                <div
                  key={item?.date ?? index}
                  className="rounded-xl border border-white/25 bg-white/15 p-2 text-center backdrop-blur"
                >
                  <p className="text-[10px] font-bold text-white/75">
                    {item
                      ? new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(
                          new Date(`${item.date}T12:00:00`),
                        )
                      : `Day ${index + 1}`}
                  </p>
                  <DayIcon className="mx-auto my-1.5 size-5 text-white" />
                  <p className="font-mono text-base font-bold">
                    {item ? `${item.rainfallMm.toFixed(1)}` : "—"}
                    <span className="text-[10px]"> mm</span>
                  </p>
                  <p className="text-[10px] text-white/75">
                    {item ? `${item.temperatureC.toFixed(0)}°C` : "Waiting"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Wind; label: string; value: string }) {
  return (
    <div className="min-w-0 py-1 text-center">
      <Icon className="mx-auto size-4 text-emerald-200" />
      <p className="mt-1 text-[9px] font-bold uppercase text-white/70">{label}</p>
      <strong className="text-sm text-white">{value}</strong>
    </div>
  );
}
