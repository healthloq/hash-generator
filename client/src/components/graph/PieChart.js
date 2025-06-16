import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

export const ApexChart = ({ doucmentCount }) => {
  const labels = [
    "Verified Documents with Verified Organizations",
    "Verified Documents with Unverified Organizations",
    "Unverified Documents",
  ];
  console.log("doucmentCount", doucmentCount);
  const originalSeries = [
    doucmentCount.verifiedDocWithVerifyOrg,
    doucmentCount.verifedDocWithUnVerifedOrg,
    doucmentCount.unVerifedDoc,
  ];
  const colors = ["#28A745", "#FB923C", "#EF4B5B"];
  const handleChartClick = (event, chartContext, config) => {
    const { dataPointIndex } = config;
  };
  const chartState = {
    series: originalSeries,
    options: {
      chart: {
        type: "donut",
        height: 350,
        events: {
          dataPointSelection: handleChartClick,
        },
      },
      labels: labels,
      colors: colors,
      dataLabels: {
        enabled: true,
        formatter: function (val, { seriesIndex, w }) {
          return w.globals.series[seriesIndex];
        },
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "40%",
          },
        },
      },
      legend: {
        show: false,
      },
    },
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* Chart */}
      <div id="chart">
        <ReactApexChart
          options={chartState.options}
          series={chartState.series}
          type="donut"
          height={200}
        />
      </div>

      {/* Custom Legend Below Chart */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "10px",
          flexDirection: "column",
        }}
      >
        {labels.map((label, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                backgroundColor: colors[index],
                borderRadius: "50%",
              }}
            ></span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
