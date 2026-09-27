import { useCallback, useEffect, useState } from "react";
import { ArrowDown, Crosshair, Database, MapPinned } from "lucide-react";
import { AlertsList } from "@/components/alerts/alerts-list";
import { RainfallChart } from "@/components/analytics/rainfall-chart";
import { LocationControls } from "@/components/location/location-controls";
import { MonsoonMap, type ClickedLocation } from "@/components/map/monsoon-map";
import { LEVEL_LABEL } from "@/services/geography-service";
import { PredictionPanel } from "@/components/predictions/prediction-panel";
import { WeatherSummary } from "@/components/weather/weather-summary";
import { WeatherUpdate } from "@/components/weather/weather-update";
import { ModelInformation } from "@/components/scientific/model-information";
import { FarmBlogSection } from "@/components/blog/farm-blog-section";
import { useGeographicSelection } from "@/hooks/use-geographic-selection";
import { monsoonService } from "@/services/monsoon-service";
import type { CurrentLocationWeather, RainfallIntelligence } from "@/types/monsoon";

export function Dashboard() {
  const location = useGeographicSelection();
  const current = location.current;
  const [point, setPoint] = useState<ClickedLocation>();
  const [currentLocationWeather, setCurrentLocationWeather] = useState<CurrentLocationWeather>();
  const [locationStatus, setLocationStatus] = useState(
    "Allow location access to see live weather for where you are.",
  );
  const [data, setData] = useState<RainfallIntelligence>(() =>
    monsoonService.getRainfallIntelligence(current),
  );
  const onPoint = useCallback((next: ClickedLocation) => setPoint(next), []);
  useEffect(() => {
    const controller = new AbortController();
    const initial = monsoonService.getRainfallIntelligence(current);
    setData(initial);
    if (current.level === "panchayat") {
      monsoonService
        .getPanchayatHistory(current, controller.signal)
        .then(setData)
        .catch(() => undefined);
    }
    return () => controller.abort();
  }, [current]);
  useEffect(() => {
    if (current.level === "panchayat" && current.code)
      localStorage.setItem(
        "grammausam-selected-panchayat",
        JSON.stringify({ code: current.code, name: current.name }),
      );
  }, [current]);
  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "This browser does not provide location access. Open the site in Chrome and select Use my current location.",
      );
      return;
    }
    setLocationStatus("Finding your location and loading weather…");
    const controller = new AbortController();
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        monsoonService
          .getCurrentLocationWeather(coords.latitude, coords.longitude, controller.signal)
          .then((weather) => {
            setCurrentLocationWeather(weather);
            setLocationStatus("Live weather loaded for your current location.");
          })
          .catch(() =>
            setLocationStatus(
              "Your location was found, but live weather could not be loaded. Please try again.",
            ),
          ),
      () =>
        setLocationStatus(
          "Location access was not available. Allow it in your browser, then select Use my current location again.",
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);
  useEffect(() => {
    if (current.level !== "panchayat") requestCurrentLocation();
  }, [current.level, requestCurrentLocation]);
  const hierarchy =
    [
      location.selection.state,
      location.selection.district,
      location.selection.block,
      location.selection.panchayat,
    ]
      .filter(Boolean)
      .map((region) => region?.name)
      .join(" · ") || "India";
  const district = location.selection.district;
  const inDhanbad = district?.id === "dhanbad--jharkhand";
  const heading = location.selection.panchayat
    ? `${location.selection.panchayat.name} forecast`
    : inDhanbad
      ? "Choose your Panchayat"
      : "Weather for your Panchayat";
  const subheading = location.selection.panchayat
    ? [location.selection.block?.name, "Dhanbad, Jharkhand"].filter(Boolean).join(" · ")
    : "Select a Dhanbad Panchayat to see the next 5 days of rain and useful farm guidance.";

  return (
    <main>
      <LocationControls
        selection={location.selection}
        options={location.options}
        onSelect={location.select}
      />
      <section
        className="bg-card px-4 pt-6 text-header-foreground lg:px-8"
        aria-label="Rainfall intelligence summary"
      >
        <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-3xl bg-deep-panel px-5 py-6 shadow-xl shadow-primary/15 lg:px-7 lg:py-7">
          <img
            src="/images/farm-advice-hero.png"
            alt="Farmer tending crops beneath a monsoon sky"
            className="absolute inset-y-0 right-0 h-full w-full object-cover object-right opacity-45 lg:w-2/3"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-panel via-deep-panel/90 to-deep-panel/25" />
          <div className="relative grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-secondary">
                GramMausam · 5-day forecast
              </p>
              <div className="mt-1 flex items-center gap-2">
                <MapPinned className="size-4 text-secondary" />
                <h1 className="text-xl font-extrabold">{heading}</h1>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-header-foreground/80">
                {subheading}
              </p>
              <p className="mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white/80 backdrop-blur">
                Weather-aware decisions for every field
              </p>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md">
              <FlowStep label="Block weather" />
              <ArrowDown className="size-3 -rotate-90 text-secondary" />
              <FlowStep label="Local adjustment" />
              <ArrowDown className="size-3 -rotate-90 text-secondary" />
              <FlowStep label="Your forecast" />
            </div>
          </div>
        </div>
      </section>
      <section
        className="border-b border-border bg-background px-4 py-7 lg:px-8"
        aria-label="Forecast and farm advice"
      >
        <div className="mx-auto grid max-w-[1600px] gap-6">
          <PredictionPanel data={data} />
          {data.state === "success" && (
            <div className="rounded-2xl border border-primary/25 bg-primary/10 px-5 py-4 text-sm text-primary">
              <strong>Live ML demonstration:</strong> the block forecast is adjusted by the Ridge
              Residual model using local elevation, slope, land cover and weather features to
              produce the Panchayat rainfall estimate above.
            </div>
          )}
          <WeatherUpdate
            weather={data.weather}
            location={location.selection.panchayat?.name ?? "Your Panchayat"}
            currentLocation={currentLocationWeather}
            locationStatus={current.level === "panchayat" ? undefined : locationStatus}
            onUseCurrentLocation={requestCurrentLocation}
          />
          <WeatherSummary data={data} />
          <AlertsList advisories={data.advisories} />
        </div>
      </section>
      <div className="grid border-b border-border bg-muted/45 px-4 py-7 lg:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-l-3xl border border-border bg-card xl:border-r-0">
          <MonsoonMap
            current={current}
            onSelect={location.select}
            onReset={() => {
              setPoint(undefined);
              location.reset();
            }}
            onPoint={onPoint}
          />
        </div>
        <aside className="rounded-b-3xl border border-border bg-deep-panel text-header-foreground xl:rounded-b-none xl:rounded-r-3xl xl:border-l xl:border-t">
          <div className="border-b border-header-foreground/15 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase text-secondary">Your selected area</p>
              <span className="rounded-sm border border-header-foreground/20 px-2 py-1 text-[9px] font-bold uppercase text-header-foreground/60">
                {LEVEL_LABEL[current.level]}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold">{current.name}</h2>
            <p className="mt-1 text-xs font-medium text-header-foreground/55">{hierarchy}</p>
            <p className="mt-3 text-sm leading-6 text-header-foreground/70">
              {current.level === "panchayat"
                ? data.message
                : "Geographic location available for administrative exploration."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-header-foreground/15">
              <Brief label="Panchayat code" value={current.code} />
              <Brief
                label="Forecast area"
                value={data.coverage === "available" ? "Dhanbad" : "Choose Dhanbad"}
              />
              <Brief
                label="Forecast status"
                value={
                  data.state === "success"
                    ? "Ready"
                    : data.state === "loading"
                      ? "Loading"
                      : "Waiting"
                }
              />
              <Brief label="Forecast period" value="Next 5 days" />
            </div>
          </div>
          <div className="border-b border-header-foreground/15 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase text-secondary">
                <Crosshair className="size-3.5" />
                {point ? "Selected location" : "Map help"}
              </p>
              {point && (
                <button
                  className="text-xs font-semibold text-secondary hover:underline"
                  onClick={() => setPoint(undefined)}
                >
                  Clear
                </button>
              )}
            </div>
            {point ? (
              <>
                {!point.detected ? (
                  <p className="mt-2 text-sm text-header-foreground/60">
                    Detecting administrative area…
                  </p>
                ) : point.detected.region ? (
                  <>
                    <div className="mt-2 space-y-0.5 text-sm">
                      {point.detected.chain.map((r) => (
                        <p key={r.id}>
                          <span className="inline-block w-24 text-xs text-header-foreground/50">
                            {LEVEL_LABEL[r.level]}
                          </span>
                          <span className="font-semibold">{r.name}</span>
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p className="text-header-foreground/50">Detected level</p>
                      <p className="text-right font-semibold">
                        {LEVEL_LABEL[point.detected.region.level]}
                      </p>
                      <p className="text-header-foreground/50">Detected area</p>
                      <p className="text-right font-semibold">{point.detected.region.name}</p>
                    </div>
                    {point.detected.blockMissing && (
                      <p className="mt-3 rounded-sm border border-header-foreground/15 bg-header-foreground/5 p-2 text-xs text-header-foreground/65">
                        <strong className="block text-secondary">District-level match</strong>No
                        confirmed block boundary covers this point.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm font-semibold">No administrative boundary found</p>
                )}
                <p className="mt-3 text-[10px] font-bold uppercase text-header-foreground/45">
                  Clicked coordinates
                </p>
                <p className="font-mono text-sm font-semibold text-secondary">
                  {point.latitude.toFixed(6)}° N · {point.longitude.toFixed(6)}° E
                </p>
                <p className="mt-2 text-xs leading-5 text-header-foreground/55">
                  Rainfall intelligence is shown only when supported for the identified
                  administrative location.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-header-foreground/60">
                <strong className="block text-secondary">Select a location</strong>Click the map to
                identify the administrative area and view available rainfall intelligence.
              </p>
            )}
          </div>
          <div className="p-5">
            <p className="metric-label text-header-foreground/45">Need help?</p>
            <p className="mt-2 text-sm font-semibold text-secondary">Search your Panchayat above</p>
            <p className="mt-2 text-xs leading-5 text-header-foreground/55">{data.message}</p>
          </div>
        </aside>
      </div>
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 lg:px-6">
        <RainfallChart data={data.history} />
        <ModelInformation />
        <aside className="source-strip" aria-label="Data transparency">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="metric-label">About this forecast</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A public weather forecast is adjusted using local Dhanbad terrain and rainfall
                patterns. Check official warnings during severe weather.
              </p>
            </div>
          </div>
          <p className="text-xs font-semibold text-foreground">
            Prototype · Not an official warning
          </p>
        </aside>
      </div>
      <FarmBlogSection />
    </main>
  );
}

function FlowStep({ label }: { label: string }) {
  return (
    <p className="text-center text-[9px] font-bold uppercase leading-4 text-header-foreground/75">
      {label}
    </p>
  );
}
function Brief({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-deep-panel p-3">
      <p className="text-[9px] font-bold uppercase text-header-foreground/45">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold">{value}</p>
    </div>
  );
}
