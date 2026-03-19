import React, { useEffect, useRef } from "react";

export const ApexChart = ({ doucmentCount }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const labels = [
    "Verified Documents with Verified Organizations",
    "Verified Documents with Unverified Organizations",
    "Unverified Documents",
  ];
  const colors = ["#28A745", "#FB923C", "#EF4B5B"];

  useEffect(() => {
    if (!chartRef.current || !window.ApexCharts) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new window.ApexCharts(chartRef.current, {
      series: [
        doucmentCount.verifiedDocWithVerifyOrg,
        doucmentCount.verifedDocWithUnVerifedOrg,
        doucmentCount.unVerifedDoc,
      ],
      chart: { type: "donut", height: 200 },
      labels,
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val, { seriesIndex, w }) => w.globals.series[seriesIndex],
      },
      plotOptions: {
        pie: { expandOnClick: false, donut: { size: "40%" } },
      },
      legend: { show: false },
    });

    chartInstance.current.render();

    return () => chartInstance.current?.destroy();
  }, [doucmentCount]);

  return (
    <div style={{ textAlign: "center" }}>
      <div ref={chartRef} />
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px", flexDirection: "column" }}>
        {labels.map((label, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold" }}>
            <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: colors[index], borderRadius: "50%" }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
