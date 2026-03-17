import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, Box, ToggleButton,
  ToggleButtonGroup, Skeleton, Alert,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import { get } from "../../Api";

const GROUP_OPTIONS = [
  { value: "day",   label: "Daily" },
  { value: "week",  label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year",  label: "Yearly" },
];

export default function ProcessingHistogram() {
  const [groupBy, setGroupBy] = useState("day");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    get(`/api/health/histogram?groupBy=${groupBy}`)
      .then((res) => {
        if (res?.status === "1") setChartData(res.data);
        else setError(res?.message || "Failed to load histogram");
      })
      .catch(() => setError("Failed to load histogram"))
      .finally(() => setLoading(false));
  }, [groupBy]);

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      bar: { columnWidth: "60%", borderRadius: 3 },
    },
    colors: ["#22c55e", "#ef4444"],
    xaxis: {
      categories: chartData?.categories || [],
      labels: {
        rotate: -45,
        style: { fontSize: "11px" },
      },
    },
    yaxis: {
      title: { text: "Files" },
      labels: { formatter: (v) => Math.floor(v) },
      min: 0,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v) => `${v} file${v !== 1 ? "s" : ""}` },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f0f0f0" },
    fill: { opacity: 1 },
  };

  const totalFiles = chartData
    ? chartData.series.reduce((acc, s) => acc + s.data.reduce((a, b) => a + b, 0), 0)
    : 0;

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Processing History
            </Typography>
            {!loading && chartData && (
              <Typography variant="body2" color="text.secondary">
                {totalFiles.toLocaleString()} total files in view
              </Typography>
            )}
          </Box>
          <ToggleButtonGroup
            value={groupBy}
            exclusive
            onChange={(_, v) => v && setGroupBy(v)}
            size="small"
          >
            {GROUP_OPTIONS.map(({ value, label }) => (
              <ToggleButton key={value} value={value} sx={{ px: 1.5 }}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Skeleton variant="rectangular" height={320} />
        ) : chartData ? (
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="bar"
            height={320}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
